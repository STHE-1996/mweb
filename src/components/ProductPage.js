import React, { useEffect, useState, useRef } from 'react';
import './ProductPage.css'; 

const baseURL = "https://apigw.mweb.co.za/prod/baas/proxy";
const logoBaseURL = "https://www.mweb.co.za/media/images/providers";

// Function to summarize product data
const getSummarizedProduct = ({ productCode, productName, productRate, subcategory }) => {
  const provider = subcategory.replace('Uncapped', '').replace('Capped', '').trim();
  return { productCode, productName, productRate, provider };
};

// Function to get products from promo codes
const getProductsFromPromo = (promoCodeData) => {
  const { products = [] } = promoCodeData;
  return products.reduce((prods, p) => [...prods, getSummarizedProduct(p)], []);
};

// Price ranges
const priceRanges = [
  { min: 0, max: 699, label: 'R0 - R699' },
  { min: 700, max: 999, label: 'R700 - R999' },
  { min: 1000, max: 9999, label: 'R1000+' }
];

const providerInfo = [
  { code: 'centurycity', name: 'Century City Connect', url: `${logoBaseURL}/provider-century.png` },
  { code: 'evotel', name: 'Evotel', url: `${logoBaseURL}/provider-evotel.png` },
  { code: 'octotel', name: 'Octotel', url: `${logoBaseURL}/provider-octotel.png` },
  { code: 'vumatel', name: 'Vumatel', url: `${logoBaseURL}/provider-vuma.png` },
  { code: 'openserve', name: 'Openserve', url: `${logoBaseURL}/provider-openserve.png` },
  { code: 'frogfoot', name: 'Frogfoot', url: `${logoBaseURL}/provider-frogfoot.png` },
  { code: 'mfn', name: 'MFN', url: `${logoBaseURL}/provider-metrofibre.png` },
  { code: 'vodacom', name: 'Vodacom', url: `${logoBaseURL}/provider-vodacom.png` },
  { code: 'linkafrica', name: 'Link Africa', url: `${logoBaseURL}/provider-linkafrica.png` },
  { code: 'linklayer', name: 'Link Layer', url: `${logoBaseURL}/provider-link-layer.png` },
  { code: 'lightstruck', name: 'Lightstruck', url: `${logoBaseURL}/provider-lightstruck.png` },
  { code: 'mitchells', name: 'Mitchells Fibre', url: `${logoBaseURL}/provider-mitchells.png` },
  { code: 'vumareach', name: 'Vuma Reach', url: `${logoBaseURL}/provider-vuma.png` }
];

const ProductPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignCode, setSelectedCampaignCode] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 9999]); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providerPromoMap, setProviderPromoMap] = useState({}); 
  const dropdownRef = useRef(null);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${baseURL}/marketing/campaigns/fibre?channels=120&visibility=public`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data.campaigns) {
          throw new Error('Campaigns data not found');
        }
        setCampaigns(data.campaigns);
        if (data.campaigns.length > 0) {
          setSelectedCampaignCode(data.campaigns[0].code);
          setSelectedCampaign(data.campaigns[0]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Update selected campaign based on selectedCampaignCode
  useEffect(() => {
    if (selectedCampaignCode) {
      const campaign = campaigns.find(c => c.code === selectedCampaignCode);
      setSelectedCampaign(campaign);
      setSelectedProviders([]); 
      setProviderPromoMap({}); 
    }
  }, [selectedCampaignCode, campaigns]);

  // Extract providers from the promo codes of the selected campaign
  useEffect(() => {
    if (selectedCampaign) {
      const promoCodes = selectedCampaign.promocodes;
      const providerSet = new Set();
      const promoMapping = {};

      const fetchPromoData = async (code) => {
        try {
          const promoURL = `${baseURL}/marketing/products/promos/${code}?sellable_online=true`;
          const response = await fetch(promoURL);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const productsFromPromo = data.reduce((prods, pc) => {
              const summarizedProducts = getProductsFromPromo(pc);
              summarizedProducts.forEach(product => {
                const provider = product.provider;
                if (provider) {
                  providerSet.add(provider);
                  if (!promoMapping[provider]) {
                    promoMapping[provider] = [];
                  }
                  promoMapping[provider].push(code); 
                }
              });
              return prods;
            }, []);
          }
        } catch (error) {
          setError(error.message);
        }
      };

      // Fetch data for each promo code
      Promise.all(promoCodes.map(fetchPromoData)).then(() => {
        setProviders(Array.from(providerSet)); 
        setProviderPromoMap(promoMapping); 
      });
    }
  }, [selectedCampaign]);

  // Fetch products based on selected providers and price range
  useEffect(() => {
    if (selectedProviders.length > 0) {
      setLoadingProducts(true);
      const promoCodes = selectedProviders.flatMap(provider => providerPromoMap[provider] || []);
      const promoCodesString = promoCodes.join(',');

      if (promoCodesString) {
        const promcodeProductsURL = `${baseURL}/marketing/products/promos/${promoCodesString}?sellable_online=true`;

        fetch(promcodeProductsURL)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              const summarizedProducts = data.reduce((prods, pc) => [...prods, ...getProductsFromPromo(pc)], []);
              
              //  filtering 
              const filterByPriceRange = (product) => {
                const price = product.productRate;
                return price >= priceRange[0] && price <= priceRange[1];
              };

              // filtering and sorting
              const selectedProviderSet = new Set(selectedProviders);
              let filteredProducts = summarizedProducts.filter(p => selectedProviderSet.has(p.provider));
              filteredProducts = filteredProducts.filter(filterByPriceRange);
              filteredProducts = filteredProducts.sort((pa, pb) => pa.productRate - pb.productRate);
              
              setProducts(filteredProducts);
            } else {
              setProducts([]);
            }
          })
          .catch(error => {
            setError(error.message);
          })
          .finally(() => {
            setLoadingProducts(false);
          });
      } else {
        setProducts([]);
        setLoadingProducts(false);
      }
    } else {
      setProducts([]);
    }
  }, [selectedProviders, providerPromoMap, priceRange]);

  const handleCampaignChange = (event) => {
    setSelectedCampaignCode(event.target.value);
  };

  const handleProviderChange = (event) => {
    const { value, checked } = event.target;
    setSelectedProviders(prevSelected =>
      checked
        ? [...prevSelected, value]
        : prevSelected.filter(provider => provider !== value)
    );
  };

  const handlePriceRangeChange = (event) => {
    const [min, max] = event.target.value.split(',').map(Number);
    setPriceRange([min, max]);
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleRemoveProvider = (providerToRemove) => {
    setSelectedProviders(prevSelected =>
      prevSelected.filter(provider => provider !== providerToRemove)
    );
  };
  

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Function to get provider logo
  const getProviderLogo = (providerCode) => {
    const provider = providerInfo.find(p => p.code.toLowerCase() === providerCode.toLowerCase());
    return provider ? provider.url : null;
  };

  

  return (
    <div className="container">
      <div className="filter-container">
        <label className="filter-label">Filter By:</label>
        <select onChange={handleCampaignChange} value={selectedCampaignCode} className="filter-select">
          {campaigns.map((campaign) => (
            <option key={campaign.code} value={campaign.code}>
              {campaign.name}
            </option>
          ))}
        </select>
        <div className="price-info">
           <div className="info-container">
             <span className="info-icon">ℹ️</span>
             <div className="tooltip">
                Select your preferred Campaigns.
             </div>
            </div>
        </div>
        <div className="providers-section">
          <div ref={dropdownRef} className="dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              {selectedProviders.length > 0 ? `${selectedProviders.length} selected` : 'Select Providers'}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {providers.map((provider, index) => (
                  <div key={index} className="dropdown-item">
                    <input
                      type="checkbox"
                      id={`provider-${index}`}
                      value={provider}
                      checked={selectedProviders.includes(provider)}
                      onChange={handleProviderChange}
                    />
                    <label htmlFor={`provider-${index}`}>{provider}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="price-info">
           <div className="info-container">
             <span className="info-icon">ℹ️</span>
             <div className="tooltip">
                You can filter multiple provider on the list.
             </div>
            </div>
        </div>
        </div>
      </div>
  
      <div className="price-range-slider">
        <input
          type="range"
          min="0"
          max="9999"
          step="1"
          value={priceRange[0]}
          onChange={(e) => handlePriceRangeChange({ target: { value: `${e.target.value},${priceRange[1]}` } })}
          className="price-slider"
          style={{ marginRight: '10px' }}
        />
        <input
          type="range"
          min="0"
          max="9999"
          step="1"
          value={priceRange[1]}
          onChange={(e) => handlePriceRangeChange({ target: { value: `${priceRange[0]},${e.target.value}` } })}
          className="price-slider"
        />
        <div>Price Range: {`R${priceRange[0]} - R${priceRange[1]}`}</div>
        <div className="price-info">
  <div className="info-container">
    <span className="info-icon">ℹ️</span>
    <div className="tooltip">
      <>You can filter based on this:</>
      <p>R0 - R699</p>
      <p>R700- R999</p>
      <p>R1000+</p>
    </div>
  </div>
</div>

      </div>

      

  
      {selectedCampaign && (
        <div className="selected-content">
        <div className="selected-providers-tags">
          {selectedProviders.map((provider, index) => (
            <div key={index} className="provider-tag">
              {provider}
              <button 
                className="provider-tag-close" 
                onClick={() => handleRemoveProvider(provider)}
                aria-label={`Remove ${provider}`}
              >
                &times; 
              </button>
            </div>
          ))}
        </div>
      
  
          <div className="product-cards-container">
    {products.length > 0 ? (
      products.map((product, index) => {
        const providerLogo = getProviderLogo(product.provider);

        return (
          <div key={index} className="product-card">
            <div className="product-info">
              <h3 className="product-title">{product.productName}</h3>
              <p className="product-description">Unthrottled</p>
              <p className="product-installation">FREE Installation + Router</p>
              <p className="product-price">R{product.productRate}pm</p>
              <div className="product-provider-logo">
                {providerLogo && <img src={providerLogo} alt={`${product.provider} Logo`} />}
              </div>
            </div>
            <div className="product-speed">
              <div className="speed-info">
                <span>Download {product.downloadSpeed}</span>
              </div>
              <div className="speed-info">
                <span>Upload {product.uploadSpeed}</span>
              </div>
              <button className="check-coverage-btn">Check coverage</button>
            </div>
          </div>
        );
      })
    ) : (
      <>
        <div className="no-products"></div>
        <img
          src="https://firebasestorage.googleapis.com/v0/b/ziontimeline.appspot.com/o/no-product.png?alt=media&token=7d164234-d583-4a79-a6b5-73710043f040"
          alt="No Products Found"
          style={{
            width: '20%',
            height: 'auto',
            marginTop: '-60px',
            position: 'absolute',
            right: '30%',
            transform: 'translateX(-50%)'
          }}
        />
      </>
    )}
  </div>

        </div>
      )}
    </div>
  );
  
  
};

export default ProductPage;
