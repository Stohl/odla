import React from 'react';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  showOnlyMyPlants, 
  onToggleMyPlants, 
  sources, 
  selectedSource, 
  onSourceChange,
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

  const [showPlanSelector, setShowPlanSelector] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md mb-6">
      <div className="p-6">
        {/* Årsplan som diskret menyval */}
        <div className="mb-6 relative">
          <label className="block text-sm font-semibold text-earth-700 mb-2">
            Visa växter från:
          </label>
          <button
            onClick={() => setShowPlanSelector(!showPlanSelector)}
            className="w-full px-5 py-3 bg-earth-100 hover:bg-earth-200 text-earth-800 rounded-lg transition-colors font-semibold text-lg flex items-center justify-between border-2 border-earth-300"
          >
            <span>
              {selectedYearPlan === 'all' ? '🌱 Alla mina sparade växter' : `📋 ${selectedYearPlan}`}
            </span>
            <span className="text-xl">{showPlanSelector ? '▲' : '▼'}</span>
          </button>
          
          {showPlanSelector && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPlanSelector(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border-2 border-earth-300 z-50 max-h-64 overflow-y-auto">
                <button
                  onClick={() => {
                    onYearPlanChange('all');
                    setShowPlanSelector(false);
                  }}
                  className={`w-full px-5 py-3 text-left hover:bg-earth-50 transition-colors border-b border-earth-100 font-semibold ${
                    selectedYearPlan === 'all' ? 'bg-earth-50 text-plant-700' : 'text-earth-700'
                  }`}
                >
                  🌱 Alla mina växter
                  {selectedYearPlan === 'all' && <span className="float-right text-plant-600">✓</span>}
                </button>
                {plansList.length > 0 && plansList.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      onYearPlanChange(plan.id);
                      setShowPlanSelector(false);
                    }}
                    className={`w-full px-5 py-3 text-left hover:bg-earth-50 transition-colors border-b border-earth-100 last:border-0 font-semibold ${
                      selectedYearPlan === plan.id ? 'bg-earth-50 text-plant-700' : 'text-earth-700'
                    }`}
                  >
                    📋 {plan.name}
                    {selectedYearPlan === plan.id && <span className="float-right text-plant-600">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gruppering - TYDLIGA KNAPPAR */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-earth-700 mb-2">
            Gruppera efter:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onGroupByChange('source')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                groupBy === 'source'
                  ? 'bg-plant-500 text-white shadow-md'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              Källa
            </button>
            {hasYearPlan && (
              <button
                onClick={() => onGroupByChange('bed')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  groupBy === 'bed'
                    ? 'bg-plant-500 text-white shadow-md'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                Odlingsbädd
              </button>
            )}
            <button
              onClick={() => onGroupByChange('none')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                groupBy === 'none'
                  ? 'bg-plant-500 text-white shadow-md'
                  : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
              }`}
            >
              Ingen
            </button>
          </div>
        </div>

        {/* Expanderbar sökning */}
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-semibold text-earth-700 hover:text-plant-600 transition-colors">
            🔍 Sök och filtrera...
          </summary>
          <div className="mt-3 flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Sök växt..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors"
              />
            </div>

            {/* Source Filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedSource}
                onChange={(e) => onSourceChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors bg-white cursor-pointer"
              >
                <option value="">Alla källor</option>
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
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
          </div>
        </details>
      </div>
    </div>
  );
};

export default FilterBar;

