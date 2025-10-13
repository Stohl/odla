import React, { useState } from 'react';
import BedManager from './BedManager';
import GardenPlanner from './GardenPlanner';

const PlanningHub = ({ myPlants }) => {
  const [activeSubView, setActiveSubView] = useState('beds'); // 'beds' or 'designs'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🏡</span>
          Trädgårdsplanering
        </h1>
        <p className="text-earth-600">
          Hantera dina odlingsbäddar och skapa visuella trädgårdsdesigner
        </p>
      </div>

      {/* Underflikar */}
      <div className="bg-white rounded-t-xl shadow-md border-b-2 border-earth-200">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveSubView('beds')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSubView === 'beds'
                ? 'bg-plant-500 text-white shadow-md'
                : 'text-earth-600 hover:bg-earth-100'
            }`}
          >
            🌿 Mina odlingsbäddar
          </button>
          <button
            onClick={() => setActiveSubView('designs')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSubView === 'designs'
                ? 'bg-plant-500 text-white shadow-md'
                : 'text-earth-600 hover:bg-earth-100'
            }`}
          >
            🪴 Visuella designer
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeSubView === 'beds' ? (
          <BedManager myPlants={myPlants} />
        ) : (
          <GardenPlanner />
        )}
      </div>
    </div>
  );
};

export default PlanningHub;

