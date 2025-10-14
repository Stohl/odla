import React from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const MyPlantsPanel = ({ 
  plants, 
  myPlants, 
  onTogglePlant, 
  selectedYearPlan, 
  yearPlans, 
  onToggleYearPlanPlant 
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const selectedPlants = plants.filter(p => myPlants.includes(p.name));
  
  // Check if a plant is in the selected year plan
  const isInYearPlan = (plantName) => {
    if (selectedYearPlan === 'all' || !yearPlans[selectedYearPlan]) return false;
    const plan = yearPlans[selectedYearPlan];
    return plan.unbeddedPlants?.includes(plantName) || false;
  };

  const hasActiveYearPlan = selectedYearPlan && selectedYearPlan !== 'all';

  if (selectedPlants.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h2 className="text-2xl font-bold text-earth-800 mb-2">Mina växter</h2>
        <p className="text-earth-600">
          Klicka på kryssrutan bredvid en växt i kalendern ovan för att lägga till den här.
        </p>
      </div>
    );
  }

  const getActivityStatus = (plant) => {
    const statuses = [];
    if (plant.seedling_months?.includes(currentMonth)) {
      statuses.push({ text: 'Förkultiveras', color: 'bg-blue-400' });
    }
    if (plant.sowing_months?.includes(currentMonth)) {
      statuses.push({ text: 'Sådd', color: 'bg-green-400' });
    }
    if (plant.harvest_months?.includes(currentMonth)) {
      statuses.push({ text: 'Redo att skörda', color: 'bg-yellow-400' });
    }
    if (statuses.length === 0) {
      statuses.push({ text: 'Vilofas', color: 'bg-earth-300' });
    }
    return statuses;
  };

  const formatMonths = (months) => {
    if (!months || months.length === 0) return '–';
    return months.map(m => MONTHS[m - 1]).join(', ');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-plant-500 to-plant-400 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🌿</span>
          Mina växter
          <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
            {selectedPlants.length} st
          </span>
        </h2>
        {hasActiveYearPlan && (
          <p className="text-plant-50 text-sm mt-2">
            💡 Klicka på en växt nedan för att lägga till/ta bort från <span className="font-semibold">{selectedYearPlan}</span>
          </p>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedPlants.map((plant) => {
            const inPlan = isInYearPlan(plant.name);
            return (
            <div
              key={plant.name}
              className={`border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all ${
                hasActiveYearPlan 
                  ? inPlan 
                    ? 'border-plant-500 bg-plant-50 cursor-pointer' 
                    : 'border-earth-200 hover:border-plant-300 cursor-pointer'
                  : 'border-earth-200'
              }`}
              onClick={() => hasActiveYearPlan && onToggleYearPlanPlant && onToggleYearPlanPlant(plant.name)}
            >
              {/* Plant Image */}
              <div className="h-48 overflow-hidden bg-earth-100">
                <img
                  src={plant.image_url}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=🌱';
                  }}
                />
              </div>

              {/* Plant Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-earth-800 mb-1 flex items-center gap-2">
                      {plant.name}
                      {hasActiveYearPlan && inPlan && (
                        <span className="text-xs bg-plant-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          I plan
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-plant-600 mb-3">{plant.category}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlant(plant.name);
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center justify-center font-bold"
                    title="Ta bort från mina växter"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-earth-600 mb-4">{plant.description}</p>

                {/* Current Status */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-earth-500 mb-2">
                    STATUS NU:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getActivityStatus(plant).map((status, idx) => (
                      <span
                        key={idx}
                        className={`${status.color} text-earth-800 text-xs px-3 py-1 rounded-full font-medium`}
                      >
                        {status.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-2 text-xs">
                  {plant.seedling_months?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="w-3 h-3 bg-blue-400 rounded flex-shrink-0 mt-0.5"></span>
                      <div>
                        <span className="font-semibold">Förkultivering:</span>{' '}
                        {formatMonths(plant.seedling_months)}
                      </div>
                    </div>
                  )}
                  {plant.sowing_months?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="w-3 h-3 bg-green-400 rounded flex-shrink-0 mt-0.5"></span>
                      <div>
                        <span className="font-semibold">Direktsådd:</span>{' '}
                        {formatMonths(plant.sowing_months)}
                      </div>
                    </div>
                  )}
                  {plant.harvest_months?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0 mt-0.5"></span>
                      <div>
                        <span className="font-semibold">Skörd:</span>{' '}
                        {formatMonths(plant.harvest_months)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyPlantsPanel;

