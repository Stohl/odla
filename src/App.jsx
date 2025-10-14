import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import CalendarView from './components/CalendarView';
import MyPlantsPanel from './components/MyPlantsPanel';
import PlanningHub from './components/PlanningHub';
import SeedBank from './components/SeedBank';

function App() {
  const [activeView, setActiveView] = useState('seedbank'); // 'seedbank', 'calendar', or 'planning'
  const [plants, setPlants] = useState([]);
  const [myPlants, setMyPlants] = useState([]);
  const [yearPlans, setYearPlans] = useState({});
  const [selectedYearPlan, setSelectedYearPlan] = useState('all'); // 'all' or planId
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(true); // Default visa endast mina växter i kalendern
  const [selectedCategory, setSelectedCategory] = useState('');
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

  // Load myPlants from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('myPlants');
    if (saved) {
      try {
        setMyPlants(JSON.parse(saved));
      } catch (e) {
        console.error('Kunde inte läsa sparade växter:', e);
      }
    }
  }, []);

  // Save myPlants to localStorage
  useEffect(() => {
    localStorage.setItem('myPlants', JSON.stringify(myPlants));
  }, [myPlants]);

  // Load year plans from localStorage
  useEffect(() => {
    const savedPlans = localStorage.getItem('yearPlans');
    if (savedPlans) {
      try {
        const data = JSON.parse(savedPlans);
        setYearPlans(data.plans || {});
      } catch (e) {
        console.error('Kunde inte läsa årsplaner:', e);
      }
    }
  }, []);

  // Toggle plant selection
  const handleTogglePlant = (plantName) => {
    setMyPlants(prev => {
      if (prev.includes(plantName)) {
        return prev.filter(name => name !== plantName);
      } else {
        return [...prev, plantName];
      }
    });
  };

  // Get unique categories
  const categories = [...new Set(plants.map(p => p.category))].sort();

  // Get plants from a specific year plan
  const getPlantsFromYearPlan = (planId) => {
    const plan = yearPlans[planId];
    if (!plan || !plan.beds) return [];
    
    const plantSet = new Set();
    Object.values(plan.beds).forEach(bed => {
      if (bed.plants && Array.isArray(bed.plants)) {
        bed.plants.forEach(plant => plantSet.add(plant));
      }
    });
    
    return Array.from(plantSet);
  };

  // Filter plants based on search, category, myPlants toggle, and year plan
  const filteredPlants = plants.filter(plant => {
    // Search filter
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = !selectedCategory || plant.category === selectedCategory;
    
    // Year plan filter
    let matchesYearPlan = true;
    if (selectedYearPlan !== 'all') {
      const planPlants = getPlantsFromYearPlan(selectedYearPlan);
      matchesYearPlan = planPlants.includes(plant.name);
    } else {
      // If "all" is selected, use the myPlants toggle
      matchesYearPlan = !showOnlyMyPlants || myPlants.includes(plant.name);
    }

    return matchesSearch && matchesCategory && matchesYearPlan;
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
      <Header />
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-earth-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveView('seedbank')}
              className={`px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'seedbank'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              🌱 Fröbank
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'calendar'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              📅 Odlingskalender
            </button>
            <button
              onClick={() => setActiveView('planning')}
              className={`px-6 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
                activeView === 'planning'
                  ? 'border-plant-500 text-plant-700 bg-plant-50'
                  : 'border-transparent text-earth-600 hover:text-plant-600 hover:bg-earth-50'
              }`}
            >
              🏡 Trädgårdsplanering
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showOnlyMyPlants={showOnlyMyPlants}
            onToggleMyPlants={() => setShowOnlyMyPlants(!showOnlyMyPlants)}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            yearPlans={yearPlans}
            selectedYearPlan={selectedYearPlan}
            onYearPlanChange={setSelectedYearPlan}
          />

          {/* Calendar View */}
          <div className="mb-8">
            <CalendarView
              plants={filteredPlants}
              myPlants={myPlants}
              onTogglePlant={handleTogglePlant}
            />
          </div>

          {/* My Plants Panel */}
          <MyPlantsPanel
            plants={plants}
            myPlants={myPlants}
            onTogglePlant={handleTogglePlant}
          />
        </main>
      ) : (
        <PlanningHub myPlants={myPlants} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-earth-200 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-earth-600 text-sm">
          <p>🌱 Knopp - Allt börjar med en knopp.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

