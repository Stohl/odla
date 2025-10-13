import React from 'react';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  showOnlyMyPlants, 
  onToggleMyPlants,
  categories,
  selectedCategory,
  onCategoryChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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

        {/* Toggle My Plants */}
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
      </div>
    </div>
  );
};

export default FilterBar;

