import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import MyPlantsPanel from './components/MyPlantsPanel';
import PlanningHub from './components/PlanningHub';
import Settings from './components/Settings';
import SeedBank from './components/SeedBank';

function App() {
  const [activeView, setActiveView] = useState('seedbank'); // 'seedbank', 'calendar', 'planning', 'settings'
  const [plants, setPlants] = useState([]);
  const [myPlants, setMyPlants] = useState([]);
  const [myPlantsLoaded, setMyPlantsLoaded] = useState(false); // Flag to prevent overwriting localStorage
  const [yearPlans, setYearPlans] = useState({});
  const [selectedYearPlan, setSelectedYearPlan] = useState('all'); // 'all' or planId
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(true); // Default visa endast mina växter i kalendern
  const [selectedSource, setSelectedSource] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'source', or 'bed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load plants data from JSON
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}fron_data.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Kunde inte ladda växtdata');
        }
        return response.json();
      })
      .then(data => {
        // Process data to ensure correct structure
        const processedData = data.map(plant => ({
          ...plant,
          // Use sowing_months for förkultivering (indoor sowing)
          seedling_months: plant.sowing_months || [],
          // Use direct_sow_months for direktsådd (outdoor sowing)
          sowing_months: plant.direct_sow_months || [],
          // Use harvest_months or bloom_months as fallback
          harvest_months: plant.harvest_months || plant.bloom_months || [],
          // Set category to a default if null
          category: plant.category || 'Övrigt'
        }));
        setPlants(processedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load myPlants from localStorage (runs once on mount)
  useEffect(() => {
    const saved = localStorage.getItem('myPlants');
    if (saved) {
      try {
        setMyPlants(JSON.parse(saved));
      } catch (e) {
        console.error('Kunde inte läsa sparade växter:', e);
      }
    }
    setMyPlantsLoaded(true); // Mark as loaded
  }, []);

  // Save myPlants to localStorage (only after initial load)
  useEffect(() => {
    if (myPlantsLoaded) {
      localStorage.setItem('myPlants', JSON.stringify(myPlants));
    }
  }, [myPlants, myPlantsLoaded]);

  // Load year plans from localStorage
  useEffect(() => {
    const loadYearPlans = () => {
      const savedPlans = localStorage.getItem('yearPlans');
      if (savedPlans) {
        try {
          const data = JSON.parse(savedPlans);
          setYearPlans(data.plans || {});
        } catch (e) {
          console.error('Kunde inte läsa årsplaner:', e);
        }
      }
    };

    // Initial load
    loadYearPlans();

    // Listen for storage changes (when updated from PlanningHub)
    const handleStorageChange = (e) => {
      if (e.key === 'yearPlans' || e.type === 'yearPlans-updated') {
        loadYearPlans();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('yearPlans-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('yearPlans-updated', handleStorageChange);
    };
  }, []);

  // Get plant dates for the selected year plan
  const getCurrentPlantDates = () => {
    if (selectedYearPlan === 'all' || !yearPlans[selectedYearPlan]) {
      return {};
    }
    return yearPlans[selectedYearPlan].plantDates || {};
  };

  // Get harvested dates for the selected year plan
  const getCurrentHarvestedDates = () => {
    if (selectedYearPlan === 'all' || !yearPlans[selectedYearPlan]) {
      return {};
    }
    return yearPlans[selectedYearPlan].harvestedDates || {};
  };

  // Update plant date for the selected year plan
  const handleDateChange = (plantId, date) => {
    if (selectedYearPlan === 'all') return;

    setYearPlans(prev => {
      const updatedPlans = { ...prev };
      if (!updatedPlans[selectedYearPlan]) return prev;

      updatedPlans[selectedYearPlan] = {
        ...updatedPlans[selectedYearPlan],
        plantDates: {
          ...(updatedPlans[selectedYearPlan].plantDates || {}),
          [plantId]: date
        },
        updatedAt: new Date().toISOString()
      };

      // Save immediately to localStorage
      localStorage.setItem('yearPlans', JSON.stringify({
        plans: updatedPlans,
        activePlan: selectedYearPlan
      }));

      return updatedPlans;
    });
  };

  // Update harvested date for the selected year plan
  const handleHarvestedChange = (plantId, date) => {
    if (selectedYearPlan === 'all') return;

    setYearPlans(prev => {
      const updatedPlans = { ...prev };
      if (!updatedPlans[selectedYearPlan]) return prev;

      updatedPlans[selectedYearPlan] = {
        ...updatedPlans[selectedYearPlan],
        harvestedDates: {
          ...(updatedPlans[selectedYearPlan].harvestedDates || {}),
          [plantId]: date
        },
        updatedAt: new Date().toISOString()
      };

      // Save immediately to localStorage
      localStorage.setItem('yearPlans', JSON.stringify({
        plans: updatedPlans,
        activePlan: selectedYearPlan
      }));

      return updatedPlans;
    });
  };

  // Toggle plant in year plan is now handled through beds only
  const handleToggleYearPlanPlant = (plantName) => {
    // This function is no longer used - plants are added through beds
    return;
  };

  // Toggle plant selection
  const handleTogglePlant = (plantId) => {
    setMyPlants(prev => {
      if (prev.includes(plantId)) {
        return prev.filter(id => id !== plantId);
      } else {
        return [...prev, plantId];
      }
    });
  };

  // Get unique sources (källa)
  const sources = [...new Set(plants.map(p => p.source || 'Okänd'))].sort();

  // Get plants from a specific year plan (only from beds)
  const getPlantsFromYearPlan = (planId) => {
    const plan = yearPlans[planId];
    if (!plan || !plan.bedPlants) return [];
    
    const plantSet = new Set();
    
    // Get all plants from all beds
    Object.values(plan.bedPlants).forEach(plantArray => {
      if (Array.isArray(plantArray)) {
        plantArray.forEach(plantId => plantSet.add(plantId));
      }
    });
    
    return Array.from(plantSet);
  };

  // Filter plants based on search, category, myPlants toggle, and year plan
  const filteredPlants = plants.filter(plant => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      plant.name.toLowerCase().includes(searchLower) ||
      (plant.source || '').toLowerCase().includes(searchLower);
    
    // Source filter
    const matchesSource = !selectedSource || (plant.source || 'Okänd') === selectedSource;
    
    // Year plan filter
    let matchesYearPlan = true;
    if (selectedYearPlan !== 'all') {
      // Show plants from year plan (even if removed from myPlants)
      const planPlants = getPlantsFromYearPlan(selectedYearPlan);
      matchesYearPlan = planPlants.includes(plant.id);
    } else {
      // If "all" is selected, use the myPlants toggle
      matchesYearPlan = !showOnlyMyPlants || myPlants.includes(plant.id);
    }

    return matchesSearch && matchesSource && matchesYearPlan;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <div className="text-xl text-earth-600">Laddar odlingskalender...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-earth-800 mb-2">Ett fel uppstod</h2>
          <p className="text-earth-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <Header
        onOpenSettings={() => setActiveView('settings')}
        isSettingsActive={activeView === 'settings'}
      />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-earth-200 shadow-sm sticky top-0 z-40">
        <div className="w-full px-2 sm:px-4 lg:px-6">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveView('seedbank')}
              className={`px-3 py-2 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'seedbank'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              🌱 Fröbank
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-2 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'calendar'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              📅 Kalender
            </button>
            <button
              onClick={() => setActiveView('planning')}
              className={`px-3 py-2 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'planning'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              🏡 Planering
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'seedbank' ? (
        <SeedBank 
          plants={plants}
          myPlants={myPlants}
          onTogglePlant={handleTogglePlant}
        />
      ) : activeView === 'calendar' ? (
        <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
          {/* Filter Bar */}
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showOnlyMyPlants={showOnlyMyPlants}
            onToggleMyPlants={() => setShowOnlyMyPlants(!showOnlyMyPlants)}
            sources={sources}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
            yearPlans={yearPlans}
            selectedYearPlan={selectedYearPlan}
            onYearPlanChange={setSelectedYearPlan}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />

          {/* Calendar View */}
          <div className="mb-8">
            <CalendarView
              plants={filteredPlants}
              myPlants={myPlants}
              onTogglePlant={handleTogglePlant}
              selectedYearPlan={selectedYearPlan}
              plantDates={getCurrentPlantDates()}
              harvestedDates={getCurrentHarvestedDates()}
              onDateChange={handleDateChange}
              onHarvestedChange={handleHarvestedChange}
              groupBy={groupBy}
              yearPlans={yearPlans}
            />
          </div>

          {/* My Plants Panel */}
          <MyPlantsPanel
            plants={plants}
            myPlants={myPlants}
            onTogglePlant={handleTogglePlant}
          />
        </main>
      ) : activeView === 'planning' ? (
        <PlanningHub myPlants={myPlants} plants={plants} />
      ) : (
        <Settings />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-earth-200 mt-16 py-6">
        <div className="w-full px-2 sm:px-4 text-center text-earth-600 text-sm">
          <p>🌱 Knopp - Allt börjar med en knopp.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

