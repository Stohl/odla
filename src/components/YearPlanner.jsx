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
      bedPlants: {}, // { bedId: [plantNames] }
      unbeddedPlants: [], // Plants not assigned to a bed
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
      unbeddedPlants: JSON.parse(JSON.stringify(plans[activePlan].unbeddedPlants || [])),
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
  const togglePlantInBed = (bedId, plantName) => {
    const currentPlants = activePlan && plans[activePlan] ? plans[activePlan].bedPlants[bedId] || [] : [];
    
    if (currentPlants.includes(plantName)) {
      updateBedPlants(bedId, currentPlants.filter(p => p !== plantName));
    } else {
      updateBedPlants(bedId, [...currentPlants, plantName]);
    }
  };

  // Växla växt i unbedded plants
  const toggleUnbeddedPlant = (plantName) => {
    if (!activePlan) return;

    setPlans(prev => {
      const currentUnbedded = prev[activePlan].unbeddedPlants || [];
      const newUnbedded = currentUnbedded.includes(plantName)
        ? currentUnbedded.filter(p => p !== plantName)
        : [...currentUnbedded, plantName];

      return {
        ...prev,
        [activePlan]: {
          ...prev[activePlan],
          unbeddedPlants: newUnbedded,
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
            {/* Växter i planen - HUVUDSEKTION */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-earth-800 mb-2 flex items-center gap-2">
                🌱 Växter i denna plan
              </h2>
              
              <p className="text-sm text-earth-600 mb-4">
                Välj vilka växter du vill odla i {activePlan}. Du kan fördela dem i bäddar längre ner om du vill.
              </p>

              {/* Plant selector - ALLTID EXPANDERAD */}
              <div className="bg-plant-50 border-2 border-plant-200 rounded-lg p-4">
                {myPlants.length === 0 ? (
                  <p className="text-sm text-earth-600 text-center py-4">
                    Inga växter i din lista. Gå till Fröbanken för att lägga till!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {myPlants.map(plant => {
                      const isSelected = currentPlan.unbeddedPlants?.includes(plant);
                      // Check if plant is in any bed
                      const isInBed = currentPlan.bedPlants && Object.values(currentPlan.bedPlants).some(
                        bedPlantArray => bedPlantArray.includes(plant)
                      );
                      
                      return (
                        <button
                          key={plant}
                          onClick={() => toggleUnbeddedPlant(plant)}
                          className={`p-3 rounded-lg text-sm transition-all relative ${
                            isSelected
                              ? 'bg-plant-500 text-white font-semibold shadow-md'
                              : 'bg-white border-2 border-plant-200 text-earth-700 hover:border-plant-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{isSelected && '✓ '}{plant}</span>
                            {isInBed && (
                              <span 
                                className={`text-xs ${isSelected ? 'text-plant-100' : 'text-earth-500'}`}
                                title="Placerad i bädd"
                              >
                                📦
                              </span>
                            )}
                          </div>
                        </button>
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
                  📦 Fördelning i odlingsbäddar
                  <span className="text-sm font-normal text-earth-500">(frivilligt)</span>
                </h2>
                <p className="text-sm text-earth-600 mb-4">
                  Fördela växterna i dina bäddar för att planera växtföljd mellan år.
                </p>

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

                    {/* Valda växter för denna bädd */}
                    {bedPlants.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-earth-700 mb-2">
                          Planteras i denna bädd:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bedPlants.map(plant => (
                            <span
                              key={plant}
                              className="text-sm bg-plant-100 text-plant-700 px-3 py-1.5 rounded-full flex items-center gap-2"
                            >
                              🌱 {plant}
                              <button
                                onClick={() => togglePlantInBed(bed.id, plant)}
                                className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Växtväljare - visa bara växter från planen */}
                    {currentPlan.unbeddedPlants && currentPlan.unbeddedPlants.length > 0 ? (
                      <details className="bg-earth-50 rounded-lg">
                        <summary className="p-3 cursor-pointer text-sm font-semibold text-earth-700 hover:bg-earth-100 rounded-lg transition-colors">
                          + Lägg till växter från planen
                        </summary>
                        <div className="p-3 pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                            {currentPlan.unbeddedPlants.map(plant => {
                              const isSelected = bedPlants.includes(plant);
                              return (
                                <button
                                  key={plant}
                                  onClick={() => togglePlantInBed(bed.id, plant)}
                                  className={`p-2 rounded-lg text-sm transition-all ${
                                    isSelected
                                      ? 'bg-earth-600 text-white font-semibold'
                                      : 'bg-white border-2 border-earth-200 text-earth-700 hover:border-earth-400'
                                  }`}
                                >
                                  {isSelected && '✓ '}{plant}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    ) : (
                      <p className="text-sm text-earth-500 italic p-3 bg-earth-50 rounded-lg">
                        Lägg till växter i planen ovan först
                      </p>
                    )}
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

