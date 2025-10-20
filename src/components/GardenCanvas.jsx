import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

const GardenCanvas = ({ grid, setGrid, width, height, cellSize }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Uppdatera canvas-storlek
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({
          width: rect.width,
          height: Math.max(400, window.innerHeight - 400),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Hantera zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const boundedScale = Math.max(0.1, Math.min(5, newScale));

    stage.scale({ x: boundedScale, y: boundedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };

    stage.position(newPos);
    setZoom(boundedScale);
  };

  // Hantera klick på ruta
  const handleCellClick = (x, y) => {
    const plantName = prompt(
      'Ange växtnamn (lämna tomt för att ta bort):',
      grid[y]?.[x]?.name || ''
    );

    if (plantName === null) return; // Användaren tryckte avbryt

    const newGrid = JSON.parse(JSON.stringify(grid));
    
    if (plantName.trim() === '') {
      newGrid[y][x] = null;
    } else {
      // Tilldela en färg baserat på växtnamn
      const colors = [
        '#86efac', '#4ade80', '#22c55e', '#16a34a', '#bbf7d0',
        '#fde047', '#facc15', '#eab308', '#fb923c', '#f97316'
      ];
      const colorIndex = plantName.length % colors.length;
      
      newGrid[y][x] = {
        name: plantName,
        color: colors[colorIndex],
        plantedAt: new Date().toISOString(),
      };
    }

    setGrid(newGrid);
  };

  // Rendera rutnät
  const renderGrid = () => {
    if (!grid || grid.length === 0) return null;

    const cells = [];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const fillColor = cell ? cell.color : '#f5f5f4';
        
        cells.push(
          <Rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fillColor}
            stroke="#d6d3d1"
            strokeWidth={0.5}
            onClick={() => handleCellClick(x, y)}
            onTap={() => handleCellClick(x, y)}
            shadowBlur={cell ? 2 : 0}
            shadowColor="rgba(0,0,0,0.3)"
          />
        );

        // Lägg till text om cellen har en växt och är tillräckligt stor
        if (cell && cellSize * zoom > 30) {
          cells.push(
            <Text
              key={`text-${x}-${y}`}
              x={x * cellSize + 2}
              y={y * cellSize + cellSize / 2 - 6}
              width={cellSize - 4}
              height={cellSize}
              text={cell.name}
              fontSize={Math.min(12, cellSize / 3)}
              fill="#000"
              align="center"
              wrap="none"
              ellipsis={true}
              listening={false}
            />
          );
        }
      }
    }
    return cells;
  };

  if (!grid || grid.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h2 className="text-2xl font-bold text-earth-800 mb-2">
          Ingen trädgård vald
        </h2>
        <p className="text-earth-600">
          Skapa en ny trädgård för att komma igång med planeringen!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Kontroller */}
      <div className="bg-earth-50 p-4 border-b border-earth-200 flex justify-between items-center">
        <div className="text-sm text-earth-600">
          <span className="font-semibold">Tips:</span> Klicka på en ruta för att plantera.
          Scrolla för att zooma. Dra för att panorera.
        </div>
        <div className="text-sm font-semibold text-earth-700">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="overflow-hidden bg-earth-100">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          draggable
          onWheel={handleWheel}
          scaleX={zoom}
          scaleY={zoom}
        >
          <Layer>{renderGrid()}</Layer>
        </Stage>
      </div>

      {/* Statistik */}
      <div className="bg-earth-50 p-4 border-t border-earth-200">
        <div className="flex flex-wrap gap-4 text-sm text-earth-600">
          <div>
            <span className="font-semibold">Rutor totalt:</span>{' '}
            {width * height}
          </div>
          <div>
            <span className="font-semibold">Planterade:</span>{' '}
            {grid.flat().filter((cell) => cell !== null).length}
          </div>
          <div>
            <span className="font-semibold">Tomma:</span>{' '}
            {grid.flat().filter((cell) => cell === null).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenCanvas;

