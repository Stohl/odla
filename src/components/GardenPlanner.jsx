import React, { useState, useEffect } from 'react';
import GardenManager from './GardenManager';
import GardenCanvas from './GardenCanvas';

const GardenPlanner = () => {
  const [gardens, setGardens] = useState({});
  const [activeGarden, setActiveGarden] = useState(null);
  const [grid, setGrid] = useState([]);
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(50);
  const [cellSize, setCellSize] = useState(20);

  // Ladda från localStorage vid start
  useEffect(() => {
    const saved = localStorage.getItem('gardensData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGardens(data.gardens || {});
        setActiveGarden(data.activeGarden || null);
        
        if (data.activeGarden && data.gardens[data.activeGarden]) {
          const garden = data.gardens[data.activeGarden];
          setGrid(garden.grid);
          setWidth(garden.width);
          setHeight(garden.height);
          setCellSize(garden.cellSize);
        }
      } catch (error) {
        console.error('Kunde inte ladda trädgårdsdata:', error);
      }
    }
  }, []);

  // Spara till localStorage vid ändringar
  useEffect(() => {
    if (Object.keys(gardens).length > 0 || activeGarden) {
      const dataToSave = {
        gardens,
        activeGarden,
      };
      localStorage.setItem('gardensData', JSON.stringify(dataToSave));
    }
  }, [gardens, activeGarden]);

  // Uppdatera aktiv trädgård när grid ändras
  useEffect(() => {
    if (activeGarden && gardens[activeGarden]) {
      const updatedGarden = {
        ...gardens[activeGarden],
        width,
        height,
        cellSize,
        grid,
        savedAt: new Date().toISOString(),
      };

      setGardens((prev) => ({
        ...prev,
        [activeGarden]: updatedGarden,
      }));
    }
  }, [grid, width, height, cellSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🪴</span>
          Mina trädgårdar
        </h1>
        <p className="text-earth-600">
          Planera och visualisera din trädgård med olika designer och layouter
        </p>
      </div>

      <GardenManager
        gardens={gardens}
        setGardens={setGardens}
        activeGarden={activeGarden}
        setActiveGarden={setActiveGarden}
        grid={grid}
        setGrid={setGrid}
        width={width}
        height={height}
        cellSize={cellSize}
        setWidth={setWidth}
        setHeight={setHeight}
        setCellSize={setCellSize}
      />

      <GardenCanvas
        grid={grid}
        setGrid={setGrid}
        width={width}
        height={height}
        cellSize={cellSize}
      />
    </div>
  );
};

export default GardenPlanner;

