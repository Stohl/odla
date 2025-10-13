import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-plant-600 to-plant-500 text-white py-8 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">🌱</span>
          Knopp
        </h1>
        <p className="text-plant-100 text-lg">
          Allt börjar med en knopp.
        </p>
      </div>
    </header>
  );
};

export default Header;

