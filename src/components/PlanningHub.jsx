import React, { useState } from 'react';
import BedManager from './BedManager';
import YearPlanner from './YearPlanner';
import GardenPlanner from './GardenPlanner';

const PlanningHub = ({ myPlants, plants }) => {
  const [activeSubView, setActiveSubView] = useState('beds'); // 'beds', 'plans', or 'designs'

  return (
    <div className="w-full px-3 sm:px-5 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🏡</span>
          Trädgårdsplanering
        </h1>
        <p className="text-earth-600 max-w-3xl">
          Planera i tre steg: börja med att definiera dina odlingsplatser, fyll dem i en årsplan
          och avsluta med en visuell design som kan exporteras och skrivas ut.
        </p>
      </div>

      {/* Underflikar */}
      <div className="bg-white rounded-xl shadow-md border border-earth-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-earth-500">
              Steg 1
            </span>
            <button
              onClick={() => setActiveSubView('beds')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                activeSubView === 'beds'
                  ? 'bg-plant-500 text-white shadow-md'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              🌿 Odlingsplatser
            </button>
            <p className="text-sm text-earth-600">
              Skapa alla odlingsbäddar och krukor som du vill använda i trädgården.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-earth-500">
              Steg 2
            </span>
            <button
              onClick={() => setActiveSubView('plans')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                activeSubView === 'plans'
                  ? 'bg-plant-500 text-white shadow-md'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              📋 Årsplaner
            </button>
            <p className="text-sm text-earth-600">
              Fördela dina växter till odlingsplatserna och planera hur året ska se ut.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-earth-500">
              Steg 3
            </span>
            <button
              onClick={() => setActiveSubView('designs')}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                activeSubView === 'designs'
                  ? 'bg-plant-500 text-white shadow-md'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              🪴 Visuella designer
            </button>
            <p className="text-sm text-earth-600">
              Bygg en visuell layout, exportera som bild eller PDF och skriv ut din plan.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeSubView === 'beds' ? (
          <BedManager />
        ) : activeSubView === 'plans' ? (
          <YearPlanner myPlants={myPlants} plants={plants} />
        ) : (
          <GardenPlanner />
        )}
      </div>
    </div>
  );
};

export default PlanningHub;

