import React, { useState, useEffect } from 'react';

const YearPlanner = ({ myPlants }) => {
  const [plans, setPlans] = useState({});
  const [activePlan, setActivePlan] = useState(null);
  const [beds, setBeds] = useState([]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Ladda odlingsbäddar
  useEffect(() => {
    const savedBeds = localStorage.getItem('myGardenBeds');
    if (savedBeds) {
      try {
        setBeds(JSON.parse(savedBeds));
      } catch (error) {
        console.error('Kunde inte ladda bäddar:', error);
      }
    }
  }, []);

  // Ladda planer från localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yearPlans');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlans(data.plans || {});
        setActivePlan(data.activePlan || null);
      } catch (error) {
        console.error('Kunde inte ladda årsplaner:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Spara planer till localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('yearPlans', JSON.stringify({
        plans,
        activePlan,
      }));
      // Notify App.jsx about the change
      window.dispatchEvent(new CustomEvent('yearPlans-updated'));
    }
  }, [plans, activePlan, isLoaded]);

  // Skapa ny plan
  const createPlan = () => {
    if (!newPlanName.trim()) {
      alert('Ange ett namn för planen');
      return;
    }

    if (plans[newPlanName]) {
      alert('En plan med detta namn finns redan');
      return;
    }

    const newPlan = {
      bedPlants: {}, // { bedId: [plantIds] }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlans({ ...plans, [newPlanName]: newPlan });
    setActivePlan(newPlanName);
    setShowNewPlanModal(false);
    setNewPlanName('');
  };

  // Kopiera plan
  const copyPlan = () => {
    if (!activePlan) {
      alert('Ingen plan att kopiera');
      return;
    }

    const newName = prompt('Namn på kopian:', `${activePlan} - Kopia`);
    if (!newName || !newName.trim()) return;

    if (plans[newName]) {
      if (!confirm('En plan med detta namn finns redan. Vill du ersätta den?')) {
        return;
      }
    }

    const copiedPlan = {
      bedPlants: JSON.parse(JSON.stringify(plans[activePlan].bedPlants)),
      plantDates: JSON.parse(JSON.stringify(plans[activePlan].plantDates || {})),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlans({ ...plans, [newName]: copiedPlan });
    setActivePlan(newName);
  };

  // Ta bort plan
  const deletePlan = () => {
    if (!activePlan) return;

    if (!confirm(`Är du säker på att du vill ta bort "${activePlan}"?`)) {
      return;
    }

    const updatedPlans = { ...plans };
    delete updatedPlans[activePlan];
    setPlans(updatedPlans);

    const remaining = Object.keys(updatedPlans);
    setActivePlan(remaining.length > 0 ? remaining[0] : null);
  };

  // Uppdatera växter för en bädd
  const updateBedPlants = (bedId, plants) => {
    if (!activePlan) return;

    setPlans(prev => ({
      ...prev,
      [activePlan]: {
        ...prev[activePlan],
        bedPlants: {
          ...prev[activePlan].bedPlants,
          [bedId]: plants,
        },
        updatedAt: new Date().toISOString(),
      }
    }));
  };

  // Växla växt för en bädd
  const togglePlantInBed = (bedId, plantId) => {
    if (!activePlan) return;
    
    setPlans(prev => {
      const currentBedPlants = prev[activePlan].bedPlants[bedId] || [];
      
      const newBedPlants = currentBedPlants.includes(plantId)
        ? currentBedPlants.filter(p => p !== plantId)
        : [...currentBedPlants, plantId];
      
      return {
        ...prev,
        [activePlan]: {
          ...prev[activePlan],
          bedPlants: {
            ...prev[activePlan].bedPlants,
            [bedId]: newBedPlants,
          },
          updatedAt: new Date().toISOString(),
        }
      };
    });
  };


  // Exportera plan
  const exportPlan = () => {
    if (!activePlan) return;

    const exportData = {
      name: activePlan,
      plan: plans[activePlan],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arsplan-${activePlan}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const planNames = Object.keys(plans);
  const currentPlan = activePlan && plans[activePlan] ? plans[activePlan] : null;

  return (
    <div className="space-y-6">
      {/* Planhantering */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Dropdown */}
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-sm font-semibold text-earth-700 mb-2">
              Aktiv årsplan
            </label>
            <select
              value={activePlan || ''}
              onChange={(e) => setActivePlan(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 bg-white"
              disabled={planNames.length === 0}
            >
              {planNames.length === 0 ? (
                <option value="">Ingen plan ännu</option>
              ) : (
                planNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))
              )}
            </select>
          </div>

          {/* Knappar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNewPlanModal(true)}
              className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold whitespace-nowrap"
            >
              ➕ Ny plan
            </button>
            {activePlan && (
              <>
                <button
                  onClick={copyPlan}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold whitespace-nowrap"
                >
                  📋 Kopiera plan
                </button>
                <button
                  onClick={exportPlan}
                  className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold whitespace-nowrap"
                >
                  📤 Exportera
                </button>
                <button
                  onClick={deletePlan}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold whitespace-nowrap"
                >
                  🗑 Ta bort
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info */}
        {currentPlan && (
          <div className="mt-4 pt-4 border-t border-earth-200">
            <div className="flex flex-wrap gap-4 text-sm text-earth-600">
              <div>
                <span className="font-semibold">Skapad:</span>{' '}
                {new Date(currentPlan.createdAt).toLocaleDateString('sv-SE')}
              </div>
              {currentPlan.updatedAt && (
                <div>
                  <span className="font-semibold">Uppdaterad:</span>{' '}
                  {new Date(currentPlan.updatedAt).toLocaleDateString('sv-SE')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Planerings-grid */}
      {!activePlan ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">Ingen årsplan vald</h2>
          <p className="text-earth-600 mb-4">
            Skapa en ny årsplan för att planera vad som ska odlas i dina bäddar
          </p>
          <button
            onClick={() => setShowNewPlanModal(true)}
            className="px-6 py-3 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            ➕ Skapa första planen
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-plant-500 to-plant-400 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📋 {activePlan}
            </h2>
          </div>

          <div className="p-6">
            {/* Växter i planen - VISA ALLA MINA VÄXTER */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-earth-800 mb-2 flex items-center gap-2">
                🌱 Mina växter
              </h2>
              
              <p className="text-sm text-earth-600 mb-4">
                Här är alla dina växter, placera dem i odlingsplatser för att spara dem i årsplanen. Här ser du vilka växter som du har placerat på odlingsplatser.
              </p>

              {/* Alla mina växter med status */}
              <div className="bg-plant-50 border-2 border-plant-300 rounded-lg p-4">
                <p className="text-xs text-earth-500 mb-2">
                  OBS: Växter måste ha ett unikt ID för att visas här. Uppdatera fron_data.json med ID-fält.
                </p>
                {myPlants.length === 0 ? (
                  <p className="text-earth-600 text-sm text-center py-4">
                    Inga växter i din lista. Gå till Fröbanken för att lägga till!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myPlants.map(plantId => {
                      // Check if plant is in any bed
                      const isInBed = currentPlan.bedPlants && Object.values(currentPlan.bedPlants).some(
                        bedPlantArray => bedPlantArray.includes(plantId)
                      );
                      
                      return (
                        <div
                          key={plantId}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 border-2 ${
                            isInBed 
                              ? 'bg-white text-plant-700 border-plant-300'
                              : 'bg-earth-100 text-earth-600 border-earth-300'
                          }`}
                        >
                          <span className="font-medium">{plantId}</span>
                          {isInBed && (
                            <span className="text-green-600 font-bold text-lg" title="Placerad i bädd">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bäddfördelning - SEKUNDÄR SEKTION */}
            {beds.length > 0 && (
              <div className="pt-6 border-t-2 border-earth-200">
                <h2 className="text-xl font-bold text-earth-700 mb-2 flex items-center gap-2">
                  Välj växtplats för dina växter
                </h2>

                <div className="space-y-4">
                  {beds.map((bed) => {
                const bedPlants = currentPlan.bedPlants[bed.id] || [];
                
                return (
                  <div
                    key={bed.id}
                    className="border-2 border-earth-200 rounded-xl p-4 hover:border-plant-300 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-earth-800 mb-3">{bed.name}</h3>
                    
                    {bed.description && (
                      <p className="text-sm text-earth-600 mb-3">{bed.description}</p>
                    )}

                    {/* Växtväljare - ALLTID EXPANDERAD, visa ALLA mina växter */}
                    <div className="bg-earth-50 border-2 border-earth-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-earth-700 mb-2">
                        Välj växter för denna plats:
                      </div>
                      {myPlants.length === 0 ? (
                        <p className="text-sm text-earth-600 text-center py-4">
                          Inga växter i din lista. Gå till Fröbanken för att lägga till!
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {myPlants.map(plantId => {
                            const isSelected = bedPlants.includes(plantId);
                            return (
                              <button
                                key={plantId}
                                onClick={() => togglePlantInBed(bed.id, plantId)}
                                className={`p-2 rounded-lg text-sm transition-all ${
                                  isSelected
                                    ? 'bg-earth-600 text-white font-semibold'
                                    : 'bg-white border-2 border-earth-200 text-earth-700 hover:border-earth-400'
                                }`}
                              >
                                {isSelected && '✓ '}{plantId}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal för ny plan */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-earth-800 mb-4">Skapa ny årsplan</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-earth-700 mb-2">
                Plannamn
              </label>
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="T.ex. 2025, 2025 Plan B, 2026..."
                className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                onKeyPress={(e) => e.key === 'Enter' && createPlan()}
              />
              <p className="text-xs text-earth-500 mt-2">
                💡 Tips: Skapa flera planer för samma år för att testa olika alternativ
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createPlan}
                className="flex-1 px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
              >
                Skapa
              </button>
              <button
                onClick={() => {
                  setShowNewPlanModal(false);
                  setNewPlanName('');
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

export default YearPlanner;

