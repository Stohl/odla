import React, { useState } from 'react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const PlantRow = ({ plant, isSelected, onToggleSelect, currentMonth }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.bottom + 8
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
    <tr className={`border-b border-earth-100 hover:bg-earth-50 transition-colors ${
      isSelected ? 'bg-plant-50' : ''
    }`}>
      {/* Plant Name Cell */}
      <td className="sticky left-0 bg-white z-10 border-r border-earth-200 shadow-sm">
        <div className="flex items-center gap-3 p-3 min-w-[250px]">
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
  );
};

export default PlantRow;

