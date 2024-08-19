
import React, { useEffect } from 'react';
import './IntroPage.css'; 
function IntroPage({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); 
    return () => clearTimeout(timer); 
  }, [onComplete]);

  return (
    <div className="intro-page">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/ziontimeline.appspot.com/o/MWEB-Logo_New.png?alt=media&token=d5df5904-1566-4bb6-a0d8-e78a2104f2e8" 
        alt="Logo" 
        className="intro-logo" 
      />
      <div className="loader-bar">
        <div className="loader-bar-fill"></div>
      </div>
    </div>
  );
}

export default IntroPage;
