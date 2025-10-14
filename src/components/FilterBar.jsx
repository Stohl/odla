import React from 'react';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  showOnlyMyPlants, 
  onToggleMyPlants,
  categories,
  selectedCategory,
  onCategoryChange,
  yearPlans,
  selectedYearPlan,
  onYearPlanChange,
  groupBy,
  onGroupByChange
}) => {
  // Convert plans object to array with names as keys
  const plansList = Object.keys(yearPlans || {}).map(planName => ({
    id: planName,
    name: planName
  }));

  const hasYearPlan = selectedYearPlan !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-col gap-4">
        {/* Första raden: Årsplan */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-earth-700 whitespace-nowrap">
            Visa växter från:
          </label>
          <div className="flex-1">
            <select
              value={selectedYearPlan}
              onChange={(e) => onYearPlanChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-plant-300 rounded-lg focus:outline-none focus:border-plant-500 transition-colors bg-white cursor-pointer font-semibold text-plant-700"
            >
              <option value="all">🌱 Alla mina sparade växter</option>
              {plansList.length > 0 && (
                <>
                  <option disabled>──────────</option>
                  {plansList.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      📋 {plan.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* Andra raden: Sök, kategori och toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Input */}
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Sök växt..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors bg-white cursor-pointer"
            >
              <option value="">Alla kategorier</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Toggle My Plants - endast när "alla" är vald */}
          {selectedYearPlan === 'all' && (
            <button
              onClick={onToggleMyPlants}
              className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                showOnlyMyPlants
                  ? 'bg-plant-500 text-white shadow-lg hover:bg-plant-600'
                  : 'bg-earth-200 text-earth-700 hover:bg-earth-300'
              }`}
            >
              {showOnlyMyPlants ? '✓ Mina växter' : 'Alla växter'}
            </button>
          )}

          {/* Gruppering */}
          <div className="w-full md:w-auto">
            <select
              value={groupBy}
              onChange={(e) => onGroupByChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors bg-white cursor-pointer"
            >
              <option value="none">Ingen gruppering</option>
              <option value="category">Gruppera efter kategori</option>
              {hasYearPlan && <option value="bed">Gruppera efter odlingsbädd</option>}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

