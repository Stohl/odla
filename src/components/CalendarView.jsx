import React from 'react';
import PlantRow from './PlantRow';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const CalendarView = ({ 
  plants, 
  myPlants, 
  onTogglePlant, 
  selectedYearPlan, 
  plantDates,
  harvestedDates, 
  onDateChange,
  onHarvestedChange,
  groupBy,
  yearPlans
}) => {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const canEditDate = selectedYearPlan !== 'all'; // Kan bara sätta datum när en specifik plan är vald

  // Group plants based on groupBy setting
  const getGroupedPlants = () => {
    if (groupBy === 'none') {
      // Sort all plants by name
      const sorted = [...plants].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      return { 'Alla växter': sorted };
    } else if (groupBy === 'category') {
      const grouped = {};
      plants.forEach(plant => {
        const category = plant.category || 'Övrigt';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(plant);
      });
      // Sort plants within each category
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
      });
      return grouped;
    } else if (groupBy === 'bed' && selectedYearPlan !== 'all') {
      const grouped = { 'Utan bädd': [] };
      const plan = yearPlans[selectedYearPlan];
      
      if (plan && plan.bedPlants) {
        // First, get all beds from localStorage
        const savedBeds = localStorage.getItem('myGardenBeds');
        const beds = savedBeds ? JSON.parse(savedBeds) : [];
        
        // Create groups for each bed
        beds.forEach(bed => {
          const bedPlantNames = plan.bedPlants[bed.id] || [];
          if (bedPlantNames.length > 0) {
            grouped[bed.name] = plants.filter(p => bedPlantNames.includes(p.name));
          }
        });
        
        // Plants not in any bed
        const allBeddedPlants = new Set();
        Object.values(plan.bedPlants).forEach(plantArray => {
          plantArray.forEach(name => allBeddedPlants.add(name));
        });
        grouped['Utan bädd'] = plants.filter(p => !allBeddedPlants.has(p.name));
      } else {
        grouped['Utan bädd'] = plants;
      }
      
      // Sort plants within each group and remove empty groups
      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        } else {
          grouped[key].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
        }
      });
      
      return grouped;
    }
    
    return { 'Alla växter': plants };
  };

  const groupedPlants = getGroupedPlants();

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
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span className="text-earth-700">Planterad</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <span className="text-earth-700">Skördad</span>
          </div>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto">
        {Object.entries(groupedPlants).map(([groupName, groupPlants]) => (
          <div key={groupName} className="mb-6 last:mb-0">
            {groupBy !== 'none' && (
              <div className="bg-gradient-to-r from-plant-400 to-plant-300 px-4 py-2 mb-2 rounded-t-lg">
                <h3 className="font-bold text-white text-lg">
                  {groupBy === 'bed' ? '📦' : '🏷️'} {groupName}
                </h3>
              </div>
            )}
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
                {groupPlants.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-earth-500">
                      Inga växter i denna grupp.
                    </td>
                  </tr>
                ) : (
                  groupPlants.map((plant) => (
                    <PlantRow
                      key={plant.name}
                      plant={plant}
                      isSelected={myPlants.includes(plant.name)}
                      onToggleSelect={onTogglePlant}
                      currentMonth={currentMonth}
                      plantedDate={plantDates?.[plant.name] || ''}
                      harvestedDate={harvestedDates?.[plant.name] || ''}
                      onDateChange={onDateChange}
                      onHarvestedChange={onHarvestedChange}
                      canEditDate={canEditDate}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;

