import React from 'react';
import GardenDesigner from './GardenDesigner';

const GardenPlanner = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🪴</span>
          Trädgårdsdesigner
        </h1>
        <p className="text-earth-600">
          Planera och visualisera din trädgård med odlingsbäddar
        </p>
      </div>

      <GardenDesigner />
    </div>
  );
};

export default GardenPlanner;

