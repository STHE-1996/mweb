import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

const providerInfo = [
  { code: "centurycity", name: "Century City Connect", url: "https://www.mweb.co.za/media/images/providers/provider-century.png" },
  { code: "evotel", name: "Evotel", url: "https://www.mweb.co.za/media/images/providers/provider-evotel.png" },
  { code: "octotel", name: "Octotel", url: "https://www.mweb.co.za/media/images/providers/provider-octotel.png" },
  { code: "vumatel", name: "Vumatel", url: "https://www.mweb.co.za/media/images/providers/provider-vuma.png" },
  { code: "openserve", name: "Openserve", url: "https://www.mweb.co.za/media/images/providers/provider-openserve.png" },
  { code: "frogfoot", name: "Frogfoot", url: "https://www.mweb.co.za/media/images/providers/provider-frogfoot.png" },
  { code: "mfn", name: "MFN", url: "https://www.mweb.co.za/media/images/providers/provider-metrofibre.png" },
  { code: "vodacom", name: "Vodacom", url: "https://www.mweb.co.za/media/images/providers/provider-vodacom.png" },
  { code: "linkafrica", name: "Link Africa", url: "https://www.mweb.co.za/media/images/providers/provider-linkafrica.png" },
  { code: "linklayer", name: "Link Layer", url: "https://www.mweb.co.za/media/images/providers/provider-link-layer.png" },
  { code: "lightstruck", name: "Lightstruck", url: "https://www.mweb.co.za/media/images/providers/provider-lightstruck.png" },
  { code: "mitchells", name: "Mitchells Fibre", url: "https://www.mweb.co.za/media/images/providers/provider-mitchells.png" },
  { code: "vumareach", name: "Vuma Reach", url: "https://www.mweb.co.za/media/images/providers/provider-vuma.png" }
];

const LogoSlideshow = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    
    <div className="slideshow">
      <p>Select a Fibre infrastructure below, browse the products availble and Complete a coverage search</p>
      <Slider {...settings}>
        {providerInfo.map(provider => (
          <div key={provider.code}>
            <img src={provider.url} alt={provider.name} style={{ width: '100%', height: 'auto' }} />
            <p style={{ textAlign: 'center' }}></p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LogoSlideshow;
