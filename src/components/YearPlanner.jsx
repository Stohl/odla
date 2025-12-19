import React, { useState, useEffect } from 'react';

const YearPlanner = ({ myPlants, plants }) => {
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

            {/* Plantering per odlingsplats - Tabell-layout */}
            {beds.length > 0 && myPlants.length > 0 ? (
              <div className="pt-6 border-t-2 border-earth-200">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-earth-800 flex items-center gap-2">
                    🌱 Plantering per odlingsplats
                  </h2>
                  <span className="text-sm text-earth-600">
                    ({beds.length} platser, {myPlants.length} växter)
                  </span>
                </div>
                <p className="text-sm text-earth-600 mb-4">
                  Klicka i cellerna för att lägga till eller ta bort växter från odlingsplatser
                </p>
                
                <div className="overflow-x-auto bg-white rounded-lg border-2 border-earth-200">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="bg-plant-100 text-plant-800 px-4 py-3 text-left font-semibold border-b-2 border-plant-300 sticky left-0 z-10 bg-plant-100">
                          Växt
                        </th>
                        {beds.map(bed => (
                          <th 
                            key={bed.id}
                            className="bg-plant-100 text-plant-800 px-4 py-3 text-center font-semibold border-b-2 border-plant-300 min-w-[120px]"
                            title={bed.description || bed.name}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{bed.name}</span>
                              {bed.description && (
                                <span className="text-xs font-normal text-plant-600">
                                  {bed.description.length > 20 ? bed.description.substring(0, 20) + '...' : bed.description}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myPlants.map((plantId, plantIdx) => {
                        const plant = plants?.find(p => p.id === plantId);
                        const plantName = plant?.name || plantId;
                        
                        return (
                          <tr 
                            key={plantId} 
                            className={plantIdx % 2 === 0 ? 'bg-white' : 'bg-earth-50 hover:bg-plant-50 transition-colors'}
                          >
                            <td className="px-4 py-3 border-b border-earth-200 text-earth-700 font-medium sticky left-0 z-10 bg-inherit">
                              {plantName}
                            </td>
                            {beds.map(bed => {
                              const bedPlants = currentPlan.bedPlants[bed.id] || [];
                              const isSelected = bedPlants.includes(plantId);
                              
                              return (
                                <td 
                                  key={bed.id}
                                  className="px-2 py-2 border-b border-earth-200 text-center"
                                >
                                  <button
                                    onClick={() => togglePlantInBed(bed.id, plantId)}
                                    className={`w-full py-2 px-2 rounded-lg transition-all ${
                                      isSelected
                                        ? 'bg-plant-500 text-white font-semibold hover:bg-plant-600'
                                        : 'bg-white border-2 border-earth-200 text-earth-600 hover:border-plant-300 hover:bg-plant-50'
                                    }`}
                                    title={isSelected ? `Ta bort ${plantName} från ${bed.name}` : `Lägg till ${plantName} i ${bed.name}`}
                                  >
                                    {isSelected ? '✓' : '+'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : beds.length === 0 ? (
              <div className="pt-6 border-t-2 border-earth-200">
                <div className="bg-earth-50 border-2 border-earth-200 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="text-lg font-bold text-earth-800 mb-2">
                    Inga odlingsplatser ännu
                  </h3>
                  <p className="text-earth-600 text-sm">
                    Gå till fliken "🌿 Odlingsplatser" för att skapa dina odlingsplatser först
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t-2 border-earth-200">
                <div className="bg-earth-50 border-2 border-earth-200 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="text-lg font-bold text-earth-800 mb-2">
                    Inga växter i din lista
                  </h3>
                  <p className="text-earth-600 text-sm">
                    Gå till fliken "🌾 Fröbank" för att lägga till växter i din lista
                  </p>
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

