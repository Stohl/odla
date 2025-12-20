import React from 'react';
import PlantRow from './PlantRow';
import html2pdf from 'html2pdf.js';

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
    } else if (groupBy === 'source') {
      const grouped = {};
      plants.forEach(plant => {
        const source = plant.source || 'Okänd';
        if (!grouped[source]) grouped[source] = [];
        grouped[source].push(plant);
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
          const bedPlantIds = plan.bedPlants[bed.id] || [];
          if (bedPlantIds.length > 0) {
            grouped[bed.name] = plants.filter(p => bedPlantIds.includes(p.id));
          }
        });
        
        // Plants not in any bed
        const allBeddedPlants = new Set();
        Object.values(plan.bedPlants).forEach(plantArray => {
          plantArray.forEach(id => allBeddedPlants.add(id));
        });
        grouped['Utan bädd'] = plants.filter(p => !allBeddedPlants.has(p.id));
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

  // Skriv ut kalender
  const printCalendar = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('sv-SE');
    const yearPlanText = selectedYearPlan && selectedYearPlan !== 'all' ? ` - ${selectedYearPlan}` : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Odlingskalender${yearPlanText}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #2d6a4f; 
              padding-bottom: 10px; 
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2d6a4f; 
              margin-bottom: 5px; 
            }
            .subtitle { 
              color: #666; 
              font-size: 14px; 
            }
            .legend { 
              margin: 15px 0; 
              padding: 10px; 
              background: #f5f5f5; 
              border-radius: 5px; 
              display: flex; 
              flex-wrap: wrap; 
              gap: 15px; 
              justify-content: center; 
            }
            .legend-item { 
              display: flex; 
              align-items: center; 
              gap: 5px; 
              font-size: 11px; 
            }
            .legend-color { 
              width: 12px; 
              height: 12px; 
              border-radius: 2px; 
            }
            .legend-icon { 
              font-size: 14px; 
            }
            .calendar-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0; 
            }
            .calendar-table th, 
            .calendar-table td { 
              border: 1px solid #ddd; 
              padding: 4px; 
              text-align: center; 
              font-size: 10px; 
              page-break-inside: avoid;
            }
            .calendar-table thead { display: table-header-group; }
            .calendar-table tbody { display: table-row-group; }
            .calendar-table tr { page-break-inside: avoid; }
            .calendar-table th { 
              background: #f0f0f0; 
              font-weight: bold; 
            }
            .plant-name { 
              text-align: left; 
              font-weight: bold; 
              min-width: 120px; 
              max-width: 120px; 
            }
            .month-cell { 
              width: 40px; 
              height: 30px; 
              position: relative; 
            }
            .activity-band { 
              position: absolute; 
              left: 0; 
              right: 0; 
              height: 8px; 
            }
            .band-seedling { 
              background: #60a5fa; 
              top: 0; 
            }
            .band-sowing { 
              background: #4ade80; 
              top: 8px; 
            }
            .band-harvest { 
              background: #fbbf24; 
              top: 16px; 
            }
            .group-header { 
              background: #2d6a4f; 
              color: white; 
              padding: 8px; 
              font-weight: bold; 
              margin: 10px 0 5px 0; 
            }
            @media print {
              body { margin: 0; padding: 10px; font-size: 10px; }
              .header { page-break-after: avoid; }
              .legend { page-break-after: avoid; }
              .group-header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Odlingskalender${yearPlanText}</div>
            <div class="subtitle">Skapad: ${currentDate}</div>
          </div>
          
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #60a5fa;"></div>
              <span>Förkultiveras inomhus</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #4ade80;"></div>
              <span>Direktsås ute</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #fbbf24;"></div>
              <span>Skördas</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">📍</span>
              <span>Planterad</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🌾</span>
              <span>Skördad</span>
            </div>
          </div>
          
          ${Object.entries(groupedPlants).map(([groupName, groupPlants]) => `
            <table class="calendar-table">
              <thead>
                ${groupBy !== 'none' ? `
                <tr>
                  <th colspan="13" style="text-align:left; background:#e8f5e9; font-size:12px;">${groupName}</th>
                </tr>` : ''}
                <tr>
                  <th class="plant-name">Växt</th>
                  ${MONTHS.map(month => `<th>${month}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${groupPlants.map(plant => `
                  <tr>
                    <td class="plant-name">${plant.name || plant.id}</td>
                    ${MONTHS.map((month, index) => {
                      const monthNum = index + 1;
                      const isSeedling = plant.seedling_months?.includes(monthNum);
                      const isSowing = plant.sowing_months?.includes(monthNum);
                      const isHarvest = plant.harvest_months?.includes(monthNum);
                      const plantedDate = plantDates?.[plant.id];
                      const harvestedDate = harvestedDates?.[plant.id];
                      
                      let plantedMonth = null;
                      let harvestedMonth = null;
                      if (plantedDate) {
                        const date = new Date(plantedDate);
                        plantedMonth = date.getMonth() + 1;
                      }
                      if (harvestedDate) {
                        const date = new Date(harvestedDate);
                        harvestedMonth = date.getMonth() + 1;
                      }
                      
                      const isPlantedMonth = plantedMonth === monthNum;
                      const isHarvestedMonth = harvestedMonth === monthNum;
                      
                      return `
                        <td class="month-cell">
                          ${isSeedling ? '<div class="activity-band band-seedling"></div>' : ''}
                          ${isSowing ? '<div class="activity-band band-sowing"></div>' : ''}
                          ${isHarvest ? '<div class="activity-band band-harvest"></div>' : ''}
                          ${isPlantedMonth ? '📍' : ''}
                          ${isHarvestedMonth ? '🌾' : ''}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Exportera kalender som PDF
  const exportCalendarAsPDF = () => {
    const currentDate = new Date().toLocaleDateString('sv-SE');
    const yearPlanText = selectedYearPlan && selectedYearPlan !== 'all' ? ` - ${selectedYearPlan}` : '';
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; font-size: 12px;">
        <style>
          .pdf-cal-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .pdf-cal-table th, .pdf-cal-table td { border: 1px solid #ddd; padding: 4px 6px; font-size: 10px; page-break-inside: avoid; }
          .pdf-cal-table td { text-align: center; }
          .pdf-cal-table thead { display: table-header-group; page-break-inside: avoid; page-break-after: avoid; }
          .pdf-cal-table tbody { display: table-row-group; }
          .pdf-cal-table tr { page-break-inside: avoid; }
          .pdf-cal-header { background: #e8f5e9; font-size: 12px; text-align: left; vertical-align: middle; padding: 6px 8px; }
          .pdf-plant-name { text-align: left; font-weight: bold; min-width: 90px; max-width: 100px; width: 100px; }
        </style>
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px;">
          <div style="font-size: 24px; font-weight: bold; color: #2d6a4f; margin-bottom: 5px;">Odlingskalender${yearPlanText}</div>
          <div style="color: #666; font-size: 14px;">Skapad: ${currentDate}</div>
        </div>
        
        <div style="margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px;">
            <div style="width: 12px; height: 12px; border-radius: 2px; background: #60a5fa;"></div>
            <span>Förkultiveras inomhus</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px;">
            <div style="width: 12px; height: 12px; border-radius: 2px; background: #4ade80;"></div>
            <span>Direktsås ute</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px;">
            <div style="width: 12px; height: 12px; border-radius: 2px; background: #fbbf24;"></div>
            <span>Skördas</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px;">
            <span style="font-size: 14px;">📍</span>
            <span>Planterad</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 11px;">
            <span style="font-size: 14px;">🌾</span>
            <span>Skördad</span>
          </div>
        </div>
        
        ${Object.entries(groupedPlants).map(([groupName, groupPlants]) => `
          <table class="pdf-cal-table">
            <thead>
              ${groupBy !== 'none' ? `
              <tr>
                <th class="pdf-cal-header" colspan="13">${groupName}</th>
              </tr>` : ''}
              <tr>
                <th class="pdf-plant-name">Växt</th>
                ${MONTHS.map(month => `<th style=\"text-align:center;\">${month}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${groupPlants.map(plant => `
                <tr>
                  <td class="pdf-plant-name" style="vertical-align: middle;">${plant.name}</td>
                  ${MONTHS.map((month, index) => {
                    const monthNum = index + 1;
                    const isSeedling = plant.seedling_months?.includes(monthNum);
                    const isSowing = plant.sowing_months?.includes(monthNum);
                    const isHarvest = plant.harvest_months?.includes(monthNum);
                    const plantedDate = plantDates?.[plant.name];
                    const harvestedDate = harvestedDates?.[plant.name];
                    
                    let plantedMonth = null;
                    let harvestedMonth = null;
                    if (plantedDate) {
                      const date = new Date(plantedDate);
                      plantedMonth = date.getMonth() + 1;
                    }
                    if (harvestedDate) {
                      const date = new Date(harvestedDate);
                      harvestedMonth = date.getMonth() + 1;
                    }
                    
                    const isPlantedMonth = plantedMonth === monthNum;
                    const isHarvestedMonth = harvestedMonth === monthNum;
                    
                    let cellContent = '';
                    if (isSeedling) cellContent += '<div style="background: #60a5fa; height: 4px; margin: 1px 0;"></div>';
                    if (isSowing) cellContent += '<div style="background: #4ade80; height: 4px; margin: 1px 0;"></div>';
                    if (isHarvest) cellContent += '<div style="background: #fbbf24; height: 4px; margin: 1px 0;"></div>';
                    if (isPlantedMonth) cellContent += '📍';
                    if (isHarvestedMonth) cellContent += '🌾';
                    
                    return `<td style="border: 1px solid #ddd; padding: 2px; text-align: center; width: 40px; height: 30px; position: relative; page-break-inside: avoid;">${cellContent}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      </div>
    `;
    
    const opt = {
      margin: 0.5,
      filename: `odlingskalender${yearPlanText}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header med gradient */}
      <div className="bg-gradient-to-r from-plant-500 to-plant-400 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
              📅 Odlingskalender
            </h2>
            {selectedYearPlan && selectedYearPlan !== 'all' && (
              <p className="text-white/90 text-sm">
                Plan: {selectedYearPlan}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCalendarAsPDF}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-semibold backdrop-blur-sm border border-white/30"
            >
              📄 PDF
            </button>
            <button
              onClick={printCalendar}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-semibold backdrop-blur-sm border border-white/30"
            >
              🖨️ Skriv ut
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-r from-plant-50 to-earth-50 p-4 border-b border-earth-200">
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-earth-200">
            <span className="w-4 h-4 bg-blue-400 rounded"></span>
            <span className="text-earth-700 font-medium">Förkultiveras inomhus</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-earth-200">
            <span className="w-4 h-4 bg-green-400 rounded"></span>
            <span className="text-earth-700 font-medium">Direktsås ute</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-earth-200">
            <span className="w-4 h-4 bg-yellow-400 rounded"></span>
            <span className="text-earth-700 font-medium">Skördas</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-earth-200">
            <span className="text-lg">📍</span>
            <span className="text-earth-700 font-medium">Planterad</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-earth-200">
            <span className="text-lg">🌾</span>
            <span className="text-earth-700 font-medium">Skördad</span>
          </div>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="overflow-x-auto p-6">
        {Object.entries(groupedPlants).map(([groupName, groupPlants]) => (
          <div key={groupName} className="mb-8 last:mb-0">
            {groupBy !== 'none' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-plant-500 to-plant-400 rounded-full"></div>
                  <h3 className="font-bold text-earth-800 text-lg">
                    {groupBy === 'bed' ? '📦' : '🏷️'} {groupName}
                  </h3>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg border-2 border-earth-200 overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-plant-100 to-plant-50 border-b-2 border-plant-300">
                    <th className="sticky left-0 bg-gradient-to-r from-plant-100 to-plant-50 z-20 p-4 text-left font-semibold text-plant-800 border-r-2 border-plant-300 shadow-sm min-w-[250px]">
                      Växt
                    </th>
                    {MONTHS.map((month, index) => {
                      const isCurrentMonth = index + 1 === currentMonth;
                      return (
                        <th
                          key={month}
                          className={`p-3 text-center font-semibold border-r border-plant-200 min-w-[60px] ${
                            isCurrentMonth 
                              ? 'bg-plant-200 text-plant-900 ring-2 ring-plant-400' 
                              : 'text-plant-700'
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
                      <td colSpan={13} className="p-8 text-center text-earth-500 bg-earth-50">
                        Inga växter i denna grupp.
                      </td>
                    </tr>
                  ) : (
                    groupPlants.map((plant) => (
                      <PlantRow
                        key={plant.id}
                        plant={plant}
                        isSelected={myPlants.includes(plant.id)}
                        onToggleSelect={onTogglePlant}
                        currentMonth={currentMonth}
                        plantedDate={plantDates?.[plant.id] || ''}
                        harvestedDate={harvestedDates?.[plant.id] || ''}
                        onDateChange={onDateChange}
                        onHarvestedChange={onHarvestedChange}
                        canEditDate={canEditDate}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;

