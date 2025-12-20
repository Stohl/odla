import React, { useState, useEffect } from 'react';

const YearPlanner = ({ myPlants, plants }) => {
  const [plans, setPlans] = useState({});
  const [activePlan, setActivePlan] = useState(null);
  const [beds, setBeds] = useState([]);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBeds, setSelectedBeds] = useState(() => {
    // Initiera med alla bäddar valda
    const savedBeds = localStorage.getItem('myGardenBeds');
    if (savedBeds) {
      try {
        const bedsData = JSON.parse(savedBeds);
        return new Set(bedsData.map(bed => bed.id));
      } catch (error) {
        return new Set();
      }
    }
    return new Set();
  });
  const [sortType, setSortType] = useState('name'); // 'name', 'placed', eller bedId
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Ladda odlingsbäddar
  useEffect(() => {
    const savedBeds = localStorage.getItem('myGardenBeds');
    if (savedBeds) {
      try {
        const bedsData = JSON.parse(savedBeds);
        setBeds(bedsData);
        // Uppdatera selectedBeds med nya bäddar (behåll befintliga val)
        setSelectedBeds(prev => {
          const newSet = new Set(prev);
          bedsData.forEach(bed => {
            if (!newSet.has(bed.id)) {
              newSet.add(bed.id); // Lägg till nya bäddar som valda
            }
          });
          return newSet;
        });
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

  // Återställ sortering när plan ändras
  useEffect(() => {
    setSortType('name');
  }, [activePlan]);

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

  // Kolla om en växt är placerad i någon odlingsplats
  const isPlantPlaced = (plantId) => {
    if (!currentPlan?.bedPlants) return false;
    return Object.values(currentPlan.bedPlants).some(
      bedPlantArray => bedPlantArray.includes(plantId)
    );
  };

  // Sortera växter baserat på sortType
  const sortedPlants = [...myPlants].sort((a, b) => {
    if (sortType === 'placed') {
      // Sortera efter placerad/ej placerad (placerade först)
      const aPlaced = isPlantPlaced(a);
      const bPlaced = isPlantPlaced(b);
      if (aPlaced !== bPlaced) {
        return aPlaced ? -1 : 1;
      }
      // Om båda är placerade eller båda ej placerade, sortera alfabetiskt
      const plantA = plants?.find(p => p.id === a);
      const plantB = plants?.find(p => p.id === b);
      const nameA = plantA?.name || a;
      const nameB = plantB?.name || b;
      return nameA.localeCompare(nameB, 'sv');
    } else if (sortType !== 'name' && currentPlan?.bedPlants) {
      // Sortera efter om växten finns i den valda bädden (sortType är bedId)
      const bedPlants = currentPlan.bedPlants[sortType] || [];
      const aInBed = bedPlants.includes(a);
      const bInBed = bedPlants.includes(b);
      if (aInBed !== bInBed) {
        return aInBed ? -1 : 1;
      }
      // Om båda finns eller båda inte finns, sortera alfabetiskt
      const plantA = plants?.find(p => p.id === a);
      const plantB = plants?.find(p => p.id === b);
      const nameA = plantA?.name || a;
      const nameB = plantB?.name || b;
      return nameA.localeCompare(nameB, 'sv');
    } else {
      // Standard: sortera alfabetiskt
      const plantA = plants?.find(p => p.id === a);
      const plantB = plants?.find(p => p.id === b);
      const nameA = plantA?.name || a;
      const nameB = plantB?.name || b;
      return nameA.localeCompare(nameB, 'sv');
    }
  });

  // Filtrera bäddar baserat på val
  const visibleBeds = beds.filter(bed => selectedBeds.has(bed.id));

  // Toggle bädd i val
  const toggleBedSelection = (bedId) => {
    setSelectedBeds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bedId)) {
        newSet.delete(bedId);
      } else {
        newSet.add(bedId);
      }
      return newSet;
    });
  };

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
                    ({visibleBeds.length} av {beds.length} platser, {sortedPlants.length} växter)
                  </span>
                </div>

                {/* Välj odlingsplatser att visa */}
                {beds.length > 3 && (
                  <div className="mb-4 p-4 bg-earth-50 border-2 border-earth-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-earth-700">Välj odlingsplatser att visa:</span>
                      <button
                        onClick={() => setSelectedBeds(new Set(beds.map(b => b.id)))}
                        className="text-xs px-2 py-1 bg-plant-500 text-white rounded hover:bg-plant-600"
                      >
                        Välj alla
                      </button>
                      <button
                        onClick={() => setSelectedBeds(new Set())}
                        className="text-xs px-2 py-1 bg-earth-200 text-earth-700 rounded hover:bg-earth-300"
                      >
                        Avmarkera alla
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {beds.map(bed => (
                        <label
                          key={bed.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-earth-200 rounded-lg cursor-pointer hover:border-plant-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBeds.has(bed.id)}
                            onChange={() => toggleBedSelection(bed.id)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm text-earth-700">{bed.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-earth-600 mb-4">
                  Klicka i cellerna för att lägga till eller ta bort växter från odlingsplatser
                </p>
                
                {visibleBeds.length > 0 ? (
                  <div className="overflow-x-auto bg-white rounded-lg border-2 border-earth-200">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th 
                            onClick={() => setSortType(sortType === 'placed' ? 'name' : 'placed')}
                            className="bg-plant-100 text-plant-800 px-4 py-3 text-left font-semibold border-b-2 border-plant-300 sticky left-0 z-10 bg-plant-100 cursor-pointer hover:bg-plant-200 transition-colors"
                            title="Klicka för att sortera efter placerad/ej placerad"
                          >
                            <div className="flex items-center gap-2">
                              Växt
                              {sortType === 'placed' && <span className="text-xs">▼</span>}
                            </div>
                          </th>
                          {visibleBeds.map(bed => (
                            <th 
                              key={bed.id}
                              onClick={() => setSortType(sortType === bed.id ? 'name' : bed.id)}
                              className={`bg-plant-100 text-plant-800 px-4 py-3 text-center font-semibold border-b-2 border-plant-300 min-w-[120px] cursor-pointer hover:bg-plant-200 transition-colors ${sortType === bed.id ? 'ring-2 ring-plant-500' : ''}`}
                              title={`Klicka för att sortera efter växter i ${bed.name}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <span>{bed.name}</span>
                                  {sortType === bed.id && <span className="text-xs">▼</span>}
                                </div>
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
                        {sortedPlants.map((plantId, plantIdx) => {
                          const plant = plants?.find(p => p.id === plantId);
                          const plantName = plant?.name || plantId;
                          const isPlaced = isPlantPlaced(plantId);
                          
                          return (
                            <tr 
                              key={plantId} 
                              className={plantIdx % 2 === 0 ? 'bg-white' : 'bg-earth-50 hover:bg-plant-50 transition-colors'}
                            >
                              <td className="px-4 py-3 border-b border-earth-200 text-earth-700 font-medium sticky left-0 z-10 bg-inherit">
                                <div className="flex items-center gap-2">
                                  {isPlaced ? (
                                    <span className="text-plant-500 font-bold" title="Placerad i minst en odlingsplats">✓</span>
                                  ) : (
                                    <span className="text-earth-400" title="Inte placerad i någon odlingsplats">○</span>
                                  )}
                                  <button
                                    onClick={() => setSelectedPlant(plantId)}
                                    className={`text-left hover:underline ${isPlaced ? 'text-plant-700' : 'text-earth-600'}`}
                                  >
                                    {plantName}
                                  </button>
                                </div>
                              </td>
                              {visibleBeds.map(bed => {
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
                ) : (
                  <div className="bg-earth-50 border-2 border-earth-200 rounded-lg p-6 text-center">
                    <p className="text-earth-600">
                      Välj minst en odlingsplats att visa i tabellen
                    </p>
                  </div>
                )}
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

      {/* Modal för växtinfo */}
      {selectedPlant && (() => {
        const plant = plants?.find(p => p.id === selectedPlant);
        if (!plant) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPlant(null)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-earth-800">{plant.name}</h2>
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="text-earth-400 hover:text-earth-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {plant.latin_name && (
                <p className="text-sm text-earth-500 italic mb-4">{plant.latin_name}</p>
              )}

              {plant.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-earth-700 mb-2">Beskrivning</h3>
                  <p className="text-sm text-earth-600">{plant.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {plant.category && (
                  <div>
                    <span className="text-sm text-earth-600">Kategori:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.category}</span>
                  </div>
                )}
                {plant.position && (
                  <div>
                    <span className="text-sm text-earth-600">Plats:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.position}</span>
                  </div>
                )}
                {plant.sowing_time && (
                  <div>
                    <span className="text-sm text-earth-600">Såtid:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.sowing_time}</span>
                  </div>
                )}
                {plant.harvest_time && (
                  <div>
                    <span className="text-sm text-earth-600">Skördas:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.harvest_time}</span>
                  </div>
                )}
                {plant.bloom_time && (
                  <div>
                    <span className="text-sm text-earth-600">Blommar:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.bloom_time}</span>
                  </div>
                )}
                {plant.germination_time && (
                  <div>
                    <span className="text-sm text-earth-600">Grodd:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.germination_time}</span>
                  </div>
                )}
                {plant.quantity && (
                  <div>
                    <span className="text-sm text-earth-600">Antal:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.quantity}</span>
                  </div>
                )}
                {plant.height_cm && (
                  <div>
                    <span className="text-sm text-earth-600">Höjd:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.height_cm}</span>
                  </div>
                )}
                {plant.color && (
                  <div>
                    <span className="text-sm text-earth-600">Färg:</span>
                    <span className="text-sm font-semibold text-earth-800 ml-2">{plant.color}</span>
                  </div>
                )}
              </div>

              {plant.product_url && (
                <div className="mt-4 pt-4 border-t border-earth-200">
                  <a
                    href={plant.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-plant-500 hover:text-plant-600 underline text-sm"
                  >
                    Läs mer om denna växt →
                  </a>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="w-full px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default YearPlanner;

