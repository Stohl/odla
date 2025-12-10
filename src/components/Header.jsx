import React from 'react';

const Header = ({ onOpenSettings, isSettingsActive }) => {
  return (
    <header className="bg-gradient-to-r from-plant-600 to-plant-500 text-white py-6 px-6 shadow-lg">
      <div className="w-full flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
            <span className="text-5xl">🌱</span>
            Knopp
          </h1>
          <p className="text-plant-100 text-lg">
            Allt börjar med en knopp.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center justify-center w-11 h-11 rounded-full border border-white/30 shadow-md transition-all backdrop-blur-sm ${
            isSettingsActive
              ? 'bg-white text-plant-700 border-white'
              : 'bg-white/15 text-white hover:bg-white/25'
          }`}
          aria-label="Inställningar"
          title="Inställningar"
        >
          <span className="text-xl">⚙️</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

