import React, { useState } from 'react';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const SeedBank = ({ plants, myPlants, onTogglePlant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOnlyMyPlants, setShowOnlyMyPlants] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'category', 'price'

  // Minimal kalendervy komponent
  const MiniCalendar = ({ plant }) => {
    return (
      <div className="flex gap-0.5">
        {MONTHS.map((month, index) => {
          const monthNum = index + 1;
          const isSeedling = plant.seedling_months?.includes(monthNum);
          const isSowing = plant.sowing_months?.includes(monthNum);
          const isHarvest = plant.harvest_months?.includes(monthNum);
          
          let bgColor = 'bg-gray-100';
          if (isSeedling && isSowing && isHarvest) bgColor = 'bg-gradient-to-b from-blue-400 via-green-400 to-yellow-400';
          else if (isSeedling && isHarvest) bgColor = 'bg-gradient-to-b from-blue-400 to-yellow-400';
          else if (isSowing && isHarvest) bgColor = 'bg-gradient-to-b from-green-400 to-yellow-400';
          else if (isSeedling) bgColor = 'bg-blue-400';
          else if (isSowing) bgColor = 'bg-green-400';
          else if (isHarvest) bgColor = 'bg-yellow-400';
          
          return (
            <div
              key={index}
              className={`w-3 h-6 ${bgColor} rounded-sm`}
              title={`${month}`}
            />
          );
        })}
      </div>
    );
  };

  // Hämta unika kategorier
  const categories = [...new Set(plants.map(p => p.category))].sort();

  // Filtrera växter
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.latin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || plant.category === selectedCategory;
    const matchesMyPlants = !showOnlyMyPlants || myPlants.includes(plant.name);

    return matchesSearch && matchesCategory && matchesMyPlants;
  });

  // Sortera
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
    if (sortBy === 'price') return (a.price_numeric || 0) - (b.price_numeric || 0);
    return 0;
  });

  const selectedPlantData = selectedPlant ? plants.find(p => p.name === selectedPlant) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-earth-800 mb-2 flex items-center gap-3">
          <span>🌱</span>
          Fröbank
        </h1>
        <p className="text-earth-600">
          Utforska {plants.length} växter och bygg din önskelista
        </p>
      </div>

      {/* Filter och sök */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sökfält */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-earth-700 mb-2">
              Sök växt
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Namn, latinsk namn, kategori..."
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 bg-white"
            >
              <option value="">Alla</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat || 'Övrigt'}</option>
              ))}
            </select>
          </div>

          {/* Sortera */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-2">
              Sortera
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 bg-white"
            >
              <option value="name">Namn</option>
              <option value="category">Kategori</option>
              <option value="price">Pris</option>
            </select>
          </div>
        </div>

        {/* Toggle mina växter */}
        <div className="mt-4 pt-4 border-t border-earth-200">
          <button
            onClick={() => setShowOnlyMyPlants(!showOnlyMyPlants)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              showOnlyMyPlants
                ? 'bg-plant-500 text-white shadow-lg'
                : 'bg-earth-200 text-earth-700 hover:bg-earth-300'
            }`}
          >
            {showOnlyMyPlants ? `✓ Mina växter (${myPlants.length})` : `Alla växter (${plants.length})`}
          </button>
          <span className="ml-4 text-sm text-earth-600">
            Visar {sortedPlants.length} växter
          </span>
        </div>
      </div>

      {/* Växtlista med expanderbara rader */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {sortedPlants.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-earth-600">Inga växter hittades</p>
          </div>
        ) : (
          <div className="divide-y divide-earth-200">
            {sortedPlants.map((plant) => {
              const isInMyList = myPlants.includes(plant.name);
              const isExpanded = selectedPlant === plant.name;

              return (
                <div key={plant.name}>
                  {/* Huvudrad */}
                  <div
                    onClick={() => setSelectedPlant(isExpanded ? null : plant.name)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-plant-50' : 'hover:bg-earth-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlant(plant.name);
                        }}
                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          isInMyList
                            ? 'bg-plant-500 border-plant-500 text-white'
                            : 'border-earth-300 hover:border-plant-400'
                        }`}
                      >
                        {isInMyList && '✓'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-earth-800">{plant.name}</div>
                            {plant.latin_name && (
                              <div className="text-xs text-earth-500 italic">{plant.latin_name}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MiniCalendar plant={plant} />
                            <span className="text-earth-400">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-plant-100 text-plant-700 px-2 py-1 rounded">
                            {plant.category || 'Övrigt'}
                          </span>
                          {plant.price && (
                            <span className="text-xs bg-earth-100 text-earth-700 px-2 py-1 rounded">
                              {plant.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanderad detalj */}
                  {isExpanded && (
                    <div className="bg-earth-50 border-t border-earth-200">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Bild */}
                          {plant.image_url && (
                            <div className="md:col-span-1">
                              <div className="h-48 overflow-hidden bg-earth-100 rounded-lg">
                                <img
                                  src={plant.image_url}
                                  alt={plant.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Info */}
                          <div className={plant.image_url ? 'md:col-span-2' : 'md:col-span-3'}>
                            {plant.description && (
                              <div className="mb-4">
                                <h3 className="text-sm font-semibold text-earth-700 mb-2">Beskrivning</h3>
                                <p className="text-sm text-earth-600 leading-relaxed">
                                  {plant.description}
                                </p>
                              </div>
                            )}

                            {/* Odlingsinformation */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                              {plant.height_cm && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Höjd:</span>
                                  <span className="font-semibold text-earth-800">{plant.height_cm}</span>
                                </div>
                              )}
                              {plant.color && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Färg:</span>
                                  <span className="font-semibold text-earth-800">{plant.color}</span>
                                </div>
                              )}
                              {plant.position && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Läge:</span>
                                  <span className="font-semibold text-earth-800">{plant.position}</span>
                                </div>
                              )}
                              {plant.sowing_time && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Såtid:</span>
                                  <span className="font-semibold text-earth-800">{plant.sowing_time}</span>
                                </div>
                              )}
                              {plant.harvest_time && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Skördas:</span>
                                  <span className="font-semibold text-earth-800">{plant.harvest_time}</span>
                                </div>
                              )}
                              {plant.bloom_time && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Blommar:</span>
                                  <span className="font-semibold text-earth-800">{plant.bloom_time}</span>
                                </div>
                              )}
                              {plant.germination_time && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Grodd:</span>
                                  <span className="font-semibold text-earth-800">{plant.germination_time}</span>
                                </div>
                              )}
                              {plant.quantity && (
                                <div className="flex justify-between">
                                  <span className="text-earth-600">Antal:</span>
                                  <span className="font-semibold text-earth-800">{plant.quantity}</span>
                                </div>
                              )}
                            </div>

                            {/* Knappar */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePlant(plant.name);
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                                  isInMyList
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-plant-500 text-white hover:bg-plant-600'
                                }`}
                              >
                                {isInMyList ? '− Ta bort från min lista' : '+ Lägg till i min lista'}
                              </button>

                              {plant.product_url && (
                                <a
                                  href={plant.product_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-4 py-2 border-2 border-plant-500 text-plant-700 rounded-lg hover:bg-plant-50 transition-colors font-semibold"
                                >
                                  🔗 Produkt
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedBank;

