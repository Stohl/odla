import React, { useState } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const PlantRow = ({ plant, isSelected, onToggleSelect, currentMonth }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left,
      y: rect.bottom + window.scrollY + 4
    });
    setShowTooltip(true);
  };

  // Create month cells with activity indicators
  const renderMonthCells = () => {
    return MONTHS.map((month, index) => {
      const monthNum = index + 1;
      const isSeedling = plant.seedling_months?.includes(monthNum);
      const isSowing = plant.sowing_months?.includes(monthNum);
      const isHarvest = plant.harvest_months?.includes(monthNum);
      const isCurrentMonth = monthNum === currentMonth;

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
      <tr className={`border-b border-earth-100 hover:bg-earth-50 transition-colors ${
        isSelected ? 'bg-plant-50' : ''
      }`}>
        {/* Plant Name Cell */}
        <td className="sticky left-0 bg-white z-10 border-r border-earth-200 shadow-sm">
          <div className="flex items-center gap-3 p-3 min-w-[250px]">
            <button
              onClick={() => onToggleSelect(plant.name)}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-plant-500 border-plant-500 text-white'
                  : 'border-earth-300 hover:border-plant-400'
              }`}
            >
              {isSelected && '✓'}
            </button>
            <div 
              className="flex-1 cursor-help"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="font-medium text-earth-800">{plant.name}</div>
              <div className="text-xs text-earth-500">{plant.category}</div>
            </div>
          </div>
        </td>

        {/* Month Cells */}
        {renderMonthCells()}
      </tr>
      
      {/* Tooltip - rendered with fixed position outside table */}
      {showTooltip && (
        <tr>
          <td colSpan={13} style={{ padding: 0, border: 'none', height: 0 }}>
            <div 
              className="fixed bg-earth-800 text-white p-4 rounded-lg shadow-2xl w-80 text-sm pointer-events-none"
              style={{ 
                left: `${tooltipPos.x}px`, 
                top: `${tooltipPos.y}px`,
                zIndex: 99999
              }}
            >
              <div className="font-bold text-base mb-1">{plant.name}</div>
              {plant.latin_name && (
                <div className="text-xs text-earth-300 italic mb-2">{plant.latin_name}</div>
              )}
              <div className="text-xs bg-plant-600 inline-block px-2 py-1 rounded mb-3">
                {plant.category}
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 bg-blue-400 rounded flex-shrink-0 mt-0.5"></span>
                  <div>
                    <span className="font-semibold">Förkultivering:</span>{' '}
                    {plant.seedling_months?.length > 0 
                      ? plant.seedling_months.map(m => MONTHS[m-1]).join(', ')
                      : '–'}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded flex-shrink-0 mt-0.5"></span>
                  <div>
                    <span className="font-semibold">Direktsådd:</span>{' '}
                    {plant.sowing_months?.length > 0 
                      ? plant.sowing_months.map(m => MONTHS[m-1]).join(', ')
                      : '–'}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0 mt-0.5"></span>
                  <div>
                    <span className="font-semibold">Skörd/Blomning:</span>{' '}
                    {plant.harvest_months?.length > 0 
                      ? plant.harvest_months.map(m => MONTHS[m-1]).join(', ')
                      : '–'}
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-earth-600 text-xs">
                <span className="text-earth-300">Status nu:</span>{' '}
                <span className="font-semibold text-yellow-300">{getActivityStatus()}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default PlantRow;

