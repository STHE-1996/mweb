import React, { useState } from 'react';
import './App.css';
import FilterProduct from './components/FilterProduct';
import LogoSlideshow from './components/LogoSlideshow';
import IntroPage from './components/IntroPage';
import ProductPage from './components/ProductPage';


function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <div className="App">
      {showIntro ? (
        <IntroPage onComplete={handleIntroComplete} />
      ) : (
        <>
          <FilterProduct />
          <LogoSlideshow />
          <ProductPage />
        </>
      )}
    </div>
  );
}

export default App;