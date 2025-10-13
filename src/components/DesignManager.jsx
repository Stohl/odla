import React, { useState } from 'react';

const DesignManager = ({ designs, setDesigns, activeDesign, setActiveDesign }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newDesignName, setNewDesignName] = useState('');

  // Skapa ny design
  const handleCreateNew = () => {
    if (!newDesignName.trim()) {
      alert('Ange ett namn för designen');
      return;
    }

    if (designs[newDesignName]) {
      alert('En design med detta namn finns redan');
      return;
    }

    const newDesign = {
      beds: [],
      orientation: 'portrait', // 'portrait' or 'landscape'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDesigns({ ...designs, [newDesignName]: newDesign });
    setActiveDesign(newDesignName);
    setShowNewModal(false);
    setNewDesignName('');
  };

  // Växla orientering
  const toggleOrientation = () => {
    if (!activeDesign) return;

    setDesigns(prev => ({
      ...prev,
      [activeDesign]: {
        ...prev[activeDesign],
        orientation: prev[activeDesign].orientation === 'portrait' ? 'landscape' : 'portrait',
        updatedAt: new Date().toISOString(),
      }
    }));
  };

  // Spara kopia
  const handleSaveAs = () => {
    if (!activeDesign) {
      alert('Ingen aktiv design att kopiera');
      return;
    }

    const name = prompt('Namn på kopian:');
    if (!name || !name.trim()) return;

    if (designs[name]) {
      if (!confirm('En design med detta namn finns redan. Vill du ersätta den?')) {
        return;
      }
    }

    const copyDesign = {
      ...designs[activeDesign],
      beds: JSON.parse(JSON.stringify(designs[activeDesign].beds)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDesigns({ ...designs, [name]: copyDesign });
    setActiveDesign(name);
  };

  // Ta bort design
  const handleDelete = () => {
    if (!activeDesign) return;

    if (!confirm(`Är du säker på att du vill ta bort "${activeDesign}"?`)) {
      return;
    }

    const updatedDesigns = { ...designs };
    delete updatedDesigns[activeDesign];
    setDesigns(updatedDesigns);

    const remaining = Object.keys(updatedDesigns);
    if (remaining.length > 0) {
      setActiveDesign(remaining[0]);
    } else {
      setActiveDesign(null);
    }
  };

  // Exportera design
  const handleExport = () => {
    if (!activeDesign) return;

    const exportData = {
      name: activeDesign,
      design: designs[activeDesign],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradgard-design-${activeDesign}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importera design
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const designName = data.name || file.name.replace('.json', '');

        if (designs[designName]) {
          if (!confirm(`En design med namnet "${designName}" finns redan. Vill du ersätta den?`)) {
            return;
          }
        }

        setDesigns({ ...designs, [designName]: data.design });
        setActiveDesign(designName);
      } catch (error) {
        alert('Kunde inte läsa filen. Kontrollera att det är en giltig JSON-fil.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const designNames = Object.keys(designs);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Dropdown */}
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-sm font-semibold text-earth-700 mb-2">
            Aktiv design
          </label>
          <select
            value={activeDesign || ''}
            onChange={(e) => setActiveDesign(e.target.value)}
            className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors bg-white cursor-pointer"
            disabled={designNames.length === 0}
          >
            {designNames.length === 0 ? (
              <option value="">Ingen design ännu</option>
            ) : (
              designNames.map((name) => (
                <option key={name} value={name}>
                  {name} ({designs[name].beds?.length || 0} bäddar)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Knappar */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold whitespace-nowrap"
          >
            ➕ Ny design
          </button>

          {activeDesign && (
            <>
              <button
                onClick={toggleOrientation}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold whitespace-nowrap"
              >
                🔄 {designs[activeDesign].orientation === 'portrait' ? 'Stående ⇅' : 'Liggande ⇆'}
              </button>

              <button
                onClick={handleSaveAs}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold whitespace-nowrap"
              >
                💾 Spara som kopia
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold whitespace-nowrap"
              >
                📤 Exportera
              </button>

              <label className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold cursor-pointer whitespace-nowrap">
                📥 Importera
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold whitespace-nowrap"
              >
                🗑 Ta bort
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info om aktiv design */}
      {activeDesign && designs[activeDesign] && (
        <div className="mt-4 pt-4 border-t border-earth-200">
          <div className="flex flex-wrap gap-4 text-sm text-earth-600">
            <div>
              <span className="font-semibold">Format:</span>{' '}
              {designs[activeDesign].orientation === 'portrait' ? 'Stående (800×1100)' : 'Liggande (1100×800)'}
            </div>
            <div>
              <span className="font-semibold">Bäddar:</span> {designs[activeDesign].beds?.length || 0}
            </div>
            <div>
              <span className="font-semibold">Skapad:</span>{' '}
              {new Date(designs[activeDesign].createdAt).toLocaleDateString('sv-SE')}
            </div>
            {designs[activeDesign].updatedAt && (
              <div>
                <span className="font-semibold">Uppdaterad:</span>{' '}
                {new Date(designs[activeDesign].updatedAt).toLocaleDateString('sv-SE')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal för ny design */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-earth-800 mb-4">Skapa ny design</h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-earth-700 mb-2">
                Namn
              </label>
              <input
                type="text"
                value={newDesignName}
                onChange={(e) => setNewDesignName(e.target.value)}
                placeholder="T.ex. 2025, Förslag 1..."
                className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateNew()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateNew}
                className="flex-1 px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
              >
                Skapa
              </button>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewDesignName('');
                }}
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

export default DesignManager;

