import React, { useState, useEffect } from 'react';

const BedManager = ({ myPlants }) => {
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [selectedPlants, setSelectedPlants] = useState([]);

  // Formulärdata
  const [formData, setFormData] = useState({
    name: '',
    width: 120,
    length: 300,
    description: '',
    plants: [],
  });

  // Ladda bäddar från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('myGardenBeds');
    if (saved) {
      try {
        setBeds(JSON.parse(saved));
      } catch (error) {
        console.error('Kunde inte ladda bäddar:', error);
      }
    }
  }, []);

  // Spara bäddar till localStorage
  useEffect(() => {
    localStorage.setItem('myGardenBeds', JSON.stringify(beds));
  }, [beds]);

  // Öppna modal för ny bädd
  const openNewBed = () => {
    setEditingBed(null);
    setFormData({
      name: '',
      width: 120,
      length: 300,
      description: '',
      plants: [],
    });
    setSelectedPlants([]);
    setShowModal(true);
  };

  // Öppna modal för redigering
  const openEditBed = (bed) => {
    setEditingBed(bed);
    setFormData({
      name: bed.name,
      width: bed.width,
      length: bed.length,
      description: bed.description || '',
      plants: bed.plants || [],
    });
    setSelectedPlants(bed.plants || []);
    setShowModal(true);
  };

  // Lägg till/ta bort växt från bädden
  const togglePlantInBed = (plantName) => {
    setSelectedPlants(prev => {
      if (prev.includes(plantName)) {
        return prev.filter(p => p !== plantName);
      } else {
        return [...prev, plantName];
      }
    });
  };

  // Spara bädd
  const saveBed = () => {
    if (!formData.name.trim()) {
      alert('Ange ett namn för bädden');
      return;
    }

    const bedData = {
      ...formData,
      plants: selectedPlants,
    };

    if (editingBed) {
      // Uppdatera befintlig
      setBeds(beds.map(b => 
        b.id === editingBed.id 
          ? { ...editingBed, ...bedData, updatedAt: new Date().toISOString() }
          : b
      ));
    } else {
      // Skapa ny
      const newBed = {
        id: Date.now(),
        ...bedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBeds([...beds, newBed]);
    }

    setShowModal(false);
    setSelectedPlants([]);
    setFormData({
      name: '',
      width: 120,
      length: 300,
      description: '',
      plants: [],
    });
  };

  // Ta bort bädd
  const deleteBed = (bedId) => {
    if (!confirm('Är du säker på att du vill ta bort denna bädd?')) {
      return;
    }
    setBeds(beds.filter(b => b.id !== bedId));
    if (selectedBed?.id === bedId) {
      setSelectedBed(null);
    }
  };

  // Exportera bäddar
  const exportBeds = () => {
    const dataStr = JSON.stringify(beds, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `odlingsbaddar-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importera bäddar
  const importBeds = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (confirm(`Vill du lägga till ${imported.length} bäddar?`)) {
          setBeds([...beds, ...imported]);
        }
      } catch (error) {
        alert('Kunde inte läsa filen');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedBedData = selectedBed ? beds.find(b => b.id === selectedBed) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🌿</span>
          Mina odlingsbäddar
        </h1>
        <p className="text-earth-600">
          Hantera dina odlingsbäddar och plantera växter i dem
        </p>
      </div>

      {/* Knappar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openNewBed}
            className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            ➕ Ny odlingsbädd
          </button>
          <button
            onClick={exportBeds}
            className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold"
            disabled={beds.length === 0}
          >
            📤 Exportera
          </button>
          <label className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold cursor-pointer">
            📥 Importera
            <input type="file" accept=".json" onChange={importBeds} className="hidden" />
          </label>
          <span className="ml-auto text-earth-600 font-semibold">
            Totalt: {beds.length} bäddar
          </span>
        </div>
      </div>

      {beds.length === 0 ? (
        /* Tom state */
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">
            Inga odlingsbäddar ännu
          </h2>
          <p className="text-earth-600 mb-4">
            Skapa din första odlingsbädd för att komma igång!
          </p>
          <button
            onClick={openNewBed}
            className="px-6 py-3 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            ➕ Skapa första bädden
          </button>
        </div>
      ) : (
        /* Lista och detaljer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vänster: Lista */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-plant-500 p-4">
                <h2 className="text-xl font-bold text-white">Alla bäddar</h2>
              </div>
              <div className="divide-y divide-earth-200">
                {beds.map((bed) => (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed(bed.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedBed === bed.id
                        ? 'bg-plant-50 border-l-4 border-plant-500'
                        : 'hover:bg-earth-50'
                    }`}
                  >
                    <div className="font-semibold text-earth-800">{bed.name}</div>
                    <div className="text-sm text-earth-600 mt-1">
                      {bed.width} × {bed.length} cm
                    </div>
                    {bed.plants && bed.plants.length > 0 && (
                      <div className="text-xs text-plant-600 mt-1">
                        🌱 {bed.plants.length} växter
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Höger: Detaljer */}
          <div className="lg:col-span-2">
            {selectedBedData ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-plant-500 to-plant-400 p-6">
                  <h2 className="text-2xl font-bold text-white">{selectedBedData.name}</h2>
                </div>
                <div className="p-6">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-earth-50 p-4 rounded-lg">
                      <div className="text-sm text-earth-600 mb-1">Bredd</div>
                      <div className="text-2xl font-bold text-earth-800">{selectedBedData.width} cm</div>
                    </div>
                    <div className="bg-earth-50 p-4 rounded-lg">
                      <div className="text-sm text-earth-600 mb-1">Längd</div>
                      <div className="text-2xl font-bold text-earth-800">{selectedBedData.length} cm</div>
                    </div>
                  </div>

                  {selectedBedData.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-earth-700 mb-2">Beskrivning</h3>
                      <p className="text-earth-600">{selectedBedData.description}</p>
                    </div>
                  )}

                  {selectedBedData.plants && selectedBedData.plants.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-earth-700 mb-2">Växter i denna bädd</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBedData.plants.map((plant) => (
                          <span
                            key={plant}
                            className="text-sm bg-plant-100 text-plant-700 px-3 py-1 rounded-full"
                          >
                            🌱 {plant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-earth-500">
                    Skapad: {new Date(selectedBedData.createdAt).toLocaleDateString('sv-SE')}
                    {selectedBedData.updatedAt && (
                      <> • Uppdaterad: {new Date(selectedBedData.updatedAt).toLocaleDateString('sv-SE')}</>
                    )}
                  </div>

                  {/* Knappar */}
                  <div className="flex gap-2 mt-6 pt-6 border-t border-earth-200">
                    <button
                      onClick={() => openEditBed(selectedBedData)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      ✏️ Redigera
                    </button>
                    <button
                      onClick={() => deleteBed(selectedBedData.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      🗑 Ta bort
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-4xl mb-4">👈</div>
                <p className="text-earth-600">Välj en bädd från listan för att se detaljer</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-earth-800 mb-4">
              {editingBed ? 'Redigera odlingsbädd' : 'Ny odlingsbädd'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Namn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="T.ex. Tomat-bädd, Rotfrukter..."
                  className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-earth-700 mb-2">
                    Bredd (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-earth-700 mb-2">
                    Längd (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Läge, jordtyp, eventuella anteckningar..."
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Växter i denna bädd
                </label>
                
                {/* Valda växter */}
                {selectedPlants.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedPlants.map((plant) => (
                      <span
                        key={plant}
                        className="text-sm bg-plant-100 text-plant-700 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {plant}
                        <button
                          onClick={() => togglePlantInBed(plant)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Knapp för att lägga till växter */}
                <button
                  type="button"
                  onClick={() => setShowPlantSelector(!showPlantSelector)}
                  className="w-full px-4 py-2 border-2 border-dashed border-plant-300 text-plant-600 rounded-lg hover:bg-plant-50 transition-colors font-semibold"
                >
                  {showPlantSelector ? '− Stäng växtval' : '+ Lägg till växter från min lista'}
                </button>

                {/* Växtväljare */}
                {showPlantSelector && (
                  <div className="mt-3 max-h-48 overflow-y-auto border-2 border-earth-200 rounded-lg">
                    {myPlants.length === 0 ? (
                      <div className="p-4 text-center text-earth-600 text-sm">
                        Inga växter i din lista ännu. Gå till Fröbanken för att lägga till växter!
                      </div>
                    ) : (
                      <div className="divide-y divide-earth-200">
                        {myPlants.map((plant) => (
                          <button
                            key={plant}
                            type="button"
                            onClick={() => togglePlantInBed(plant)}
                            className={`w-full p-3 text-left hover:bg-earth-50 transition-colors flex items-center justify-between ${
                              selectedPlants.includes(plant) ? 'bg-plant-50' : ''
                            }`}
                          >
                            <span className="text-earth-800">{plant}</span>
                            {selectedPlants.includes(plant) && (
                              <span className="text-plant-600 font-bold">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveBed}
                className="flex-1 px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
              >
                💾 Spara
              </button>
              <button
                onClick={() => setShowModal(false)}
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

export default BedManager;

