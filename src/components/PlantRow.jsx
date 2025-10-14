import React, { useState } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const PlantRow = ({ 
  plant, 
  isSelected, 
  onToggleSelect, 
  currentMonth, 
  plantedDate, 
  onDateChange,
  canEditDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Create month cells with activity indicators
  const renderMonthCells = () => {
    // Parse planted date if exists
    let plantedMonth = null;
    if (plantedDate) {
      const date = new Date(plantedDate);
      plantedMonth = date.getMonth() + 1; // 1-12
    }

    return MONTHS.map((month, index) => {
      const monthNum = index + 1;
      const isSeedling = plant.seedling_months?.includes(monthNum);
      const isSowing = plant.sowing_months?.includes(monthNum);
      const isHarvest = plant.harvest_months?.includes(monthNum);
      const isCurrentMonth = monthNum === currentMonth;
      const isPlantedMonth = plantedMonth === monthNum;

      let cellContent = null;
      let cellClass = 'relative h-12 border-r border-earth-100';

      if (isCurrentMonth) {
        cellClass += ' bg-plant-50';
      }

      // Render activity bands
      const activities = [];
      if (isSeedling) {
        activities.push(
          <div
            key="seedling"
            className="absolute top-0 left-0 right-0 h-1/3 bg-blue-400"
            title="Förkultiveras inomhus"
          />
        );
      }
      if (isSowing) {
        activities.push(
          <div
            key="sowing"
            className={`absolute left-0 right-0 h-1/3 bg-green-400 ${
              isSeedling ? 'top-1/3' : 'top-0'
            }`}
            title="Direktsås ute"
          />
        );
      }
      if (isHarvest) {
        const topPosition = isSeedling && isSowing ? 'top-2/3' : 
                           isSeedling || isSowing ? 'top-1/3' : 'top-0';
        activities.push(
          <div
            key="harvest"
            className={`absolute left-0 right-0 h-1/3 bg-yellow-400 ${topPosition}`}
            title="Skördas"
          />
        );
      }

      // Show planting indicator if this is the planted month
      if (isPlantedMonth) {
        // Calculate position based on day of month
        const day = new Date(plantedDate).getDate();
        let positionClass = 'justify-center'; // Default center
        
        if (day <= 7) {
          positionClass = 'justify-start pl-1';
        } else if (day <= 14) {
          positionClass = 'justify-start pl-6';
        } else if (day <= 21) {
          positionClass = 'justify-end pr-6';
        } else {
          positionClass = 'justify-end pr-1';
        }
        
        activities.push(
          <div
            key="planted"
            className={`absolute inset-0 flex items-center ${positionClass} z-10`}
            title={`Planterad ${new Date(plantedDate).toLocaleDateString('sv-SE')}`}
          >
            <span className="text-2xl drop-shadow-md">📍</span>
          </div>
        );
      }

      return (
        <td key={index} className={cellClass}>
          {activities}
        </td>
      );
    });
  };

  // Get current activity status
  const getActivityStatus = () => {
    const statuses = [];
    if (plant.seedling_months?.includes(currentMonth)) {
      statuses.push('förkultiveras');
    }
    if (plant.sowing_months?.includes(currentMonth)) {
      statuses.push('sådd');
    }
    if (plant.harvest_months?.includes(currentMonth)) {
      statuses.push('redo att skörda');
    }
    return statuses.join(', ') || 'vilofas';
  };

  return (
    <>
      <tr 
        className={`border-b border-earth-100 hover:bg-earth-50 transition-colors cursor-pointer ${
          isExpanded ? 'bg-plant-50' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Plant Name Cell */}
        <td className="sticky left-0 bg-white z-10 border-r border-earth-200 shadow-sm">
          <div className="flex items-center gap-3 p-3 min-w-[250px]">
            <span className="text-earth-400 text-sm">
              {isExpanded ? '▼' : '▶'}
            </span>
            <div className="flex-1">
              <div className="font-medium text-earth-800">{plant.name}</div>
              <div className="text-xs text-earth-500">{plant.category}</div>
            </div>
          </div>
        </td>

        {/* Month Cells */}
        {renderMonthCells()}
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-earth-50">
          <td colSpan={13} className="p-6" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-4xl">
              {/* Plant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="font-semibold text-earth-800 mb-2">Information</h3>
                  {plant.latin_name && (
                    <p className="text-sm text-earth-600 italic mb-2">{plant.latin_name}</p>
                  )}
                  {plant.description && (
                    <p className="text-sm text-earth-600">{plant.description}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-earth-800 mb-2">Odlingstider</h3>
                  <div className="space-y-2 text-sm">
                    {plant.seedling_months?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="w-3 h-3 bg-blue-400 rounded flex-shrink-0 mt-0.5"></span>
                        <div>
                          <span className="font-semibold">Förkultivering:</span>{' '}
                          {plant.seedling_months.map(m => MONTHS[m-1]).join(', ')}
                        </div>
                      </div>
                    )}
                    {plant.sowing_months?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="w-3 h-3 bg-green-400 rounded flex-shrink-0 mt-0.5"></span>
                        <div>
                          <span className="font-semibold">Direktsådd:</span>{' '}
                          {plant.sowing_months.map(m => MONTHS[m-1]).join(', ')}
                        </div>
                      </div>
                    )}
                    {plant.harvest_months?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0 mt-0.5"></span>
                        <div>
                          <span className="font-semibold">Skörd/Blomning:</span>{' '}
                          {plant.harvest_months.map(m => MONTHS[m-1]).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Planting Date */}
              {canEditDate && (
                <div className="pt-4 border-t border-earth-200">
                  <label className="block text-sm font-semibold text-earth-700 mb-2">
                    📅 Planteringsdatum (frivilligt)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={plantedDate || ''}
                      onChange={(e) => onDateChange(plant.name, e.target.value)}
                      className="px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 transition-colors"
                    />
                    {plantedDate && (
                      <>
                        <span className="text-sm text-earth-600">
                          Planterad {new Date(plantedDate).toLocaleDateString('sv-SE')}
                        </span>
                        <button
                          onClick={() => onDateChange(plant.name, '')}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Rensa
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-earth-500 mt-1">
                    Markera när du har planterat denna växt för att hålla koll på din odling
                  </p>
                </div>
              )}

              {!canEditDate && (
                <div className="pt-4 border-t border-earth-200 text-sm text-earth-600">
                  💡 <span className="font-semibold">Tips:</span> Välj en specifik årsplan ovan för att kunna markera planteringsdatum
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default PlantRow;

