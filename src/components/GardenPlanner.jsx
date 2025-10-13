import React, { useState, useEffect } from 'react';
import DesignManager from './DesignManager';
import GardenDesigner from './GardenDesigner';

const GardenPlanner = () => {
  const [designs, setDesigns] = useState({});
  const [activeDesign, setActiveDesign] = useState(null);

  // Ladda från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gardenDesigns');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setDesigns(data.designs || {});
        setActiveDesign(data.activeDesign || null);
      } catch (error) {
        console.error('Kunde inte ladda designs:', error);
      }
    }
  }, []);

  // Spara till localStorage
  useEffect(() => {
    if (Object.keys(designs).length > 0 || activeDesign) {
      localStorage.setItem('gardenDesigns', JSON.stringify({
        designs,
        activeDesign,
      }));
    }
  }, [designs, activeDesign]);

  // Uppdatera bäddar för aktiv design
  const setBeds = (beds) => {
    if (!activeDesign) return;

    setDesigns((prev) => ({
      ...prev,
      [activeDesign]: {
        ...prev[activeDesign],
        beds: beds,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const activeBeds = activeDesign && designs[activeDesign] ? designs[activeDesign].beds || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🪴</span>
          Trädgårdsdesigner
        </h1>
        <p className="text-earth-600">
          Skapa och hantera olika trädgårdsdesigner med odlingsbäddar
        </p>
      </div>

      <DesignManager
        designs={designs}
        setDesigns={setDesigns}
        activeDesign={activeDesign}
        setActiveDesign={setActiveDesign}
      />

      {activeDesign ? (
        <GardenDesigner
          beds={activeBeds}
          setBeds={setBeds}
          designName={activeDesign}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">
            Ingen design vald
          </h2>
          <p className="text-earth-600">
            Skapa en ny design för att komma igång med planeringen!
          </p>
        </div>
      )}
    </div>
  );
};

export default GardenPlanner;

