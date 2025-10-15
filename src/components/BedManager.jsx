import React, { useState, useEffect } from 'react';

const BedManager = () => {
  const [beds, setBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Formulärdata
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'bed', // 'bed' or 'pot'
  });

  const [expandedBed, setExpandedBed] = useState(null);

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
    setIsLoaded(true);
  }, []);

  // Spara bäddar till localStorage (endast efter laddning)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('myGardenBeds', JSON.stringify(beds));
    }
  }, [beds, isLoaded]);

  // Öppna modal för ny bädd
  const openNewBed = () => {
    setEditingBed(null);
    setFormData({
      name: '',
      description: '',
      type: 'bed',
    });
    setShowModal(true);
  };

  // Öppna modal för redigering
  const openEditBed = (bed) => {
    setEditingBed(bed);
    setFormData({
      name: bed.name,
      description: bed.description || '',
      type: bed.type || 'bed',
    });
    setShowModal(true);
  };

  // Spara bädd
  const saveBed = () => {
    if (!formData.name.trim()) {
      alert('Ange ett namn för odlingsplatsen');
      return;
    }

    if (editingBed) {
      // Uppdatera befintlig
      setBeds(beds.map(b => 
        b.id === editingBed.id 
          ? { ...editingBed, ...formData, updatedAt: new Date().toISOString() }
          : b
      ));
    } else {
      // Skapa ny
      const newBed = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBeds([...beds, newBed]);
    }

    setShowModal(false);
    setExpandedBed(null);
    setFormData({
      name: '',
      description: '',
      type: 'bed',
    });
  };

  // Ta bort bädd
  const deleteBed = (bedId) => {
    if (!confirm('Är du säker på att du vill ta bort denna odlingsplats?')) {
      return;
    }
    setBeds(beds.filter(b => b.id !== bedId));
    if (expandedBed === bedId) {
      setExpandedBed(null);
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
          Odlingsplatser
        </h1>
        <p className="text-earth-600">
          Hantera dina odlingsbäddar, krukor och andra odlingsplatser
        </p>
      </div>

      {/* Knappar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openNewBed}
            className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            ➕ Ny odlingsplats
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
            Totalt: {beds.length} platser
          </span>
        </div>
      </div>

      {beds.length === 0 ? (
        /* Tom state */
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">
            Inga odlingsplatser ännu
          </h2>
          <p className="text-earth-600 mb-4">
            Skapa din första odlingsplats för att komma igång!
          </p>
          <button
            onClick={openNewBed}
            className="px-6 py-3 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            ➕ Skapa första platsen
          </button>
        </div>
      ) : (
        /* Expanderbara rader */
        <div className="bg-white rounded-xl shadow-md overflow-hidden divide-y divide-earth-200">
          {beds.map((bed) => {
            const isExpanded = expandedBed === bed.id;
            
            return (
              <div key={bed.id}>
                {/* Huvudrad */}
                <div
                  onClick={() => setExpandedBed(isExpanded ? null : bed.id)}
                  className="p-4 cursor-pointer hover:bg-earth-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {bed.type === 'pot' ? (
                        <span className="text-2xl">🪴</span>
                      ) : (
                        <div className="w-8 h-6 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm border-2 border-amber-800 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-earth-800 text-lg">{bed.name}</div>
                        {bed.description && (
                          <div className="text-sm text-earth-500 mt-0.5">
                            {bed.description.substring(0, 80)}{bed.description.length > 80 ? '...' : ''}
                          </div>
                        )}
                        <div className="text-xs text-earth-400 mt-1">
                          {bed.type === 'pot' ? 'Kruka' : 'Odlingsbädd'}
                        </div>
                      </div>
                    </div>
                    <span className="text-earth-400 text-xl">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Expanderad vy */}
                {isExpanded && (
                  <div className="bg-earth-50 p-6 border-t border-earth-200">
                    <div className="max-w-3xl">
                      {bed.description && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-earth-700 mb-2">Beskrivning</h3>
                          <p className="text-earth-600">{bed.description}</p>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800">
                          💡 <span className="font-semibold">Tips:</span> Gå till fliken "📋 Årsplaner" för att planera vad som ska odlas här
                        </p>
                      </div>

                      <div className="text-xs text-earth-500 mb-4">
                        Skapad: {new Date(bed.createdAt).toLocaleDateString('sv-SE')}
                        {bed.updatedAt && (
                          <> • Uppdaterad: {new Date(bed.updatedAt).toLocaleDateString('sv-SE')}</>
                        )}
                      </div>

                      {/* Knappar */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditBed(bed);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        >
                          ✏️ Redigera
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBed(bed.id);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                        >
                          🗑 Ta bort
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-earth-800 mb-4">
              {editingBed ? 'Redigera odlingsplats' : 'Ny odlingsplats'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Typ av odlingsplats
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'bed' })}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      formData.type === 'bed'
                        ? 'border-plant-500 bg-plant-50'
                        : 'border-earth-200 hover:border-earth-300'
                    }`}
                  >
                    <div className="w-6 h-4 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm border border-amber-800 flex-shrink-0"></div>
                    <span className="font-semibold text-earth-800 text-sm">Odlingsbädd</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'pot' })}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      formData.type === 'pot'
                        ? 'border-plant-500 bg-plant-50'
                        : 'border-earth-200 hover:border-earth-300'
                    }`}
                  >
                    <span className="text-xl">🪴</span>
                    <span className="font-semibold text-earth-800 text-sm">Kruka</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-2">
                  Namn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.type === 'pot' ? 'T.ex. Stor kruka vid verandan...' : 'T.ex. Tomat-bädd, Rotfrukter...'}
                  className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                />
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

