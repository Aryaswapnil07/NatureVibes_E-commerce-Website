import React from 'react';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h2>Sanctuary at Home</h2>
        <p>From rare succulents to solid wood furniture, create your perfect ecosystem.</p>
        <a href="#full-catalog" onClick={(e) => {
             e.preventDefault();
             document.getElementById('full-catalog')?.scrollIntoView({behavior: 'smooth'});
        }}>
           <button>Explore Collection</button>
        </a>
      </div>
    </section>
  );
};

export default Hero;