import React from 'react';
import PlantRow from './PlantRow';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const CalendarView = ({ plants, myPlants, onTogglePlant }) => {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Legend */}
      <div className="bg-earth-50 p-4 border-b border-earth-200">
        <div className="flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-400 rounded"></span>
            <span className="text-earth-700">Förkultiveras inomhus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-400 rounded"></span>
            <span className="text-earth-700">Direktsås ute</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400 rounded"></span>
            <span className="text-earth-700">Skördas</span>
          </div>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-earth-100 border-b-2 border-earth-300">
              <th className="sticky left-0 bg-earth-100 z-20 p-3 text-left font-semibold text-earth-800 border-r border-earth-200 shadow-sm min-w-[250px]">
                Växt
              </th>
              {MONTHS.map((month, index) => {
                const isCurrentMonth = index + 1 === currentMonth;
                return (
                  <th
                    key={month}
                    className={`p-3 text-center font-semibold text-earth-700 border-r border-earth-100 min-w-[60px] ${
                      isCurrentMonth ? 'bg-plant-100 text-plant-800' : ''
                    }`}
                  >
                    {month}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-8 text-center text-earth-500">
                  Inga växter att visa. Prova att ändra filtren.
                </td>
              </tr>
            ) : (
              plants.map((plant) => (
                <PlantRow
                  key={plant.name}
                  plant={plant}
                  isSelected={myPlants.includes(plant.name)}
                  onToggleSelect={onTogglePlant}
                  currentMonth={currentMonth}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarView;

