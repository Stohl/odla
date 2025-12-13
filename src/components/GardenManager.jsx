import React, { useState } from 'react';

const GardenManager = ({
  gardens,
  setGardens,
  activeGarden,
  setActiveGarden,
  grid,
  setGrid,
  width,
  height,
  cellSize,
  setWidth,
  setHeight,
  setCellSize,
}) => {
  const [showNewGardenModal, setShowNewGardenModal] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [newWidth, setNewWidth] = useState(50);
  const [newHeight, setNewHeight] = useState(50);
  const [newCellSize, setNewCellSize] = useState(20);

  // Skapa ny trädgård
  const handleCreateNewGarden = () => {
    if (!newGardenName.trim()) {
      alert('Ange ett namn för trädgården');
      return;
    }

    if (gardens[newGardenName]) {
      alert('En trädgård med detta namn finns redan');
      return;
    }

    const emptyGrid = Array(newHeight)
      .fill(null)
      .map(() => Array(newWidth).fill(null));

    const newGarden = {
      width: newWidth,
      height: newHeight,
      cellSize: newCellSize,
      grid: emptyGrid,
      savedAt: new Date().toISOString(),
    };

    const updatedGardens = { ...gardens, [newGardenName]: newGarden };
    setGardens(updatedGardens);
    setActiveGarden(newGardenName);
    setGrid(emptyGrid);
    setWidth(newWidth);
    setHeight(newHeight);
    setCellSize(newCellSize);
    setShowNewGardenModal(false);
    setNewGardenName('');
  };

  // Spara aktuell design som ny
  const handleSaveAs = () => {
    const name = prompt('Ange namn för denna design:');
    if (!name) return;

    if (gardens[name]) {
      if (!confirm('En trädgård med detta namn finns redan. Vill du ersätta den?')) {
        return;
      }
    }

    const newGarden = {
      width,
      height,
      cellSize,
      grid: JSON.parse(JSON.stringify(grid)),
      savedAt: new Date().toISOString(),
    };

    const updatedGardens = { ...gardens, [name]: newGarden };
    setGardens(updatedGardens);
    setActiveGarden(name);
  };

  // Växla trädgård
  const handleSwitchGarden = (name) => {
    const garden = gardens[name];
    if (!garden) return;

    setActiveGarden(name);
    setGrid(JSON.parse(JSON.stringify(garden.grid)));
    setWidth(garden.width);
    setHeight(garden.height);
    setCellSize(garden.cellSize);
  };

  // Ta bort trädgård
  const handleDeleteGarden = () => {
    if (!activeGarden) return;
    
    if (!confirm(`Är du säker på att du vill ta bort "${activeGarden}"?`)) {
      return;
    }

    const updatedGardens = { ...gardens };
    delete updatedGardens[activeGarden];
    setGardens(updatedGardens);

    // Växla till första tillgängliga trädgård
    const remainingGardens = Object.keys(updatedGardens);
    if (remainingGardens.length > 0) {
      handleSwitchGarden(remainingGardens[0]);
    } else {
      setActiveGarden(null);
      setGrid([]);
    }
  };

  // Exportera trädgård
  const handleExport = () => {
    if (!activeGarden) return;

    const exportData = {
      name: activeGarden,
      garden: gardens[activeGarden],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradgard-${activeGarden}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importera trädgård
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const gardenName = data.name || file.name.replace('.json', '');
        
        if (gardens[gardenName]) {
          if (!confirm(`En trädgård med namnet "${gardenName}" finns redan. Vill du ersätta den?`)) {
            return;
          }
        }

        const updatedGardens = { ...gardens, [gardenName]: data.garden };
        setGardens(updatedGardens);
        setActiveGarden(gardenName);
        setGrid(JSON.parse(JSON.stringify(data.garden.grid)));
        setWidth(data.garden.width);
        setHeight(data.garden.height);
        setCellSize(data.garden.cellSize);
      } catch (error) {
        alert('Kunde inte läsa filen. Kontrollera att det är en giltig JSON-fil.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const gardenNames = Object.keys(gardens);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Dropdown för val av trädgård */}
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-sm font-semibold text-earth-700 mb-2">
            Aktiv trädgård
          </label>
          <select
            value={activeGarden || ''}
            onChange={(e) => handleSwitchGarden(e.target.value)}
            className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors bg-white cursor-pointer"
            disabled={gardenNames.length === 0}
          >
            {gardenNames.length === 0 ? (
              <option value="">Ingen trädgård ännu</option>
            ) : (
              gardenNames.map((name) => (
                <option key={name} value={name}>
                  {name} ({gardens[name].width}×{gardens[name].height})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Knappar */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewGardenModal(true)}
            className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold whitespace-nowrap"
          >
            ➕ Ny trädgård
          </button>

          {activeGarden && (
            <>
              <button
                onClick={handleSaveAs}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold whitespace-nowrap"
              >
                💾 Spara som
              </button>

              <button
                onClick={handleDeleteGarden}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold whitespace-nowrap"
              >
                🗑 Ta bort
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info om aktiv trädgård */}
      {activeGarden && gardens[activeGarden] && (
        <div className="mt-4 pt-4 border-t border-earth-200">
          <div className="flex flex-wrap gap-4 text-sm text-earth-600">
            <div>
              <span className="font-semibold">Storlek:</span> {width}×{height} rutor
            </div>
            <div>
              <span className="font-semibold">Rutstorlek:</span> {cellSize}px
            </div>
            <div>
              <span className="font-semibold">Sparad:</span>{' '}
              {new Date(gardens[activeGarden].savedAt).toLocaleString('sv-SE')}
            </div>
          </div>
        </div>
      )}

      {/* Modal för ny trädgård */}
      {showNewGardenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-earth-800 mb-4">Skapa ny trädgård</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Namn
                </label>
                <input
                  type="text"
                  value={newGardenName}
                  onChange={(e) => setNewGardenName(e.target.value)}
                  placeholder="T.ex. 2025, Förslag 1..."
                  className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-earth-700 mb-2">
                    Bredd (rutor)
                  </label>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={(e) => setNewWidth(parseInt(e.target.value) || 50)}
                    min="10"
                    max="200"
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-earth-700 mb-2">
                    Höjd (rutor)
                  </label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseInt(e.target.value) || 50)}
                    min="10"
                    max="200"
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Rutstorlek (px)
                </label>
                <input
                  type="number"
                  value={newCellSize}
                  onChange={(e) => setNewCellSize(parseInt(e.target.value) || 20)}
                  min="10"
                  max="100"
                  className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateNewGarden}
                className="flex-1 px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
              >
                Skapa
              </button>
              <button
                onClick={() => setShowNewGardenModal(false)}
                className="flex-1 px-4 py-2 bg-earth-200 text-earth-700 rounded-lg hover:bg-earth-300 transition-colors font-semibold"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenManager;

