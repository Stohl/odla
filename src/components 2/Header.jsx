import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-plant-600 to-plant-500 text-white py-8 px-6 shadow-lg">
      <div className="w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">🌱</span>
          Min Odlingskalender
        </h1>
        <p className="text-plant-100 text-lg">
          Planera din odlingssäsong - från sådd till skörd
        </p>
      </div>
    </header>
  );
};

export default Header;

