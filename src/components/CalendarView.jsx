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
    const currentMonth = new Date().getMonth() + 1;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Odlingskalender${yearPlanText}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
              font-size: 12px;
              background: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%);
              padding: 24px 32px; 
              margin: 0 0 24px 0;
            }
            .header-content {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .title { 
              font-size: 26px; 
              font-weight: 800; 
              color: #ffffff; 
              margin: 0;
              letter-spacing: -0.025em;
            }
            .subtitle { 
              color: rgba(255,255,255,0.9); 
              font-size: 13px; 
              margin: 4px 0 0 0;
            }
            .legend { 
              margin: 0 32px 24px 32px; 
              padding: 16px; 
              background: linear-gradient(90deg, #f0fdf4, #ecfdf5);
              border-radius: 12px; 
              border: 1px solid #bbf7d0;
              display: flex; 
              flex-wrap: wrap; 
              gap: 8px; 
              justify-content: center; 
            }
            .legend-item { 
              display: inline-flex;
              align-items: center; 
              gap: 6px; 
              padding: 6px 12px;
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              font-size: 11px;
            }
            .legend-color { 
              width: 14px; 
              height: 14px; 
              border-radius: 3px; 
            }
            .calendar-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              border: 2px solid #d1d5db;
              border-radius: 8px;
              overflow: hidden;
            }
            .calendar-table th, 
            .calendar-table td { 
              padding: 8px 6px; 
              text-align: center; 
              font-size: 10px; 
              page-break-inside: avoid;
              border-right: 1px solid #e5e7eb;
            }
            .calendar-table thead { display: table-header-group; }
            .calendar-table tbody { display: table-row-group; }
            .calendar-table tbody tr:nth-child(even) { background: #f9fafb; }
            .calendar-table tr { page-break-inside: avoid; border-bottom: 1px solid #e5e7eb; }
            .calendar-table th { 
              background: linear-gradient(180deg, #dcfce7, #bbf7d0);
              color: #166534;
              font-weight: 600;
            }
            .plant-name { 
              background: linear-gradient(180deg, #f0fdf4, #ecfdf5);
              text-align: left; 
              font-weight: 600; 
              min-width: 150px; 
              max-width: 150px; 
              width: 150px;
              padding: 8px 12px;
              border-right: 2px solid #86efac;
              color: #166534;
            }
            .month-cell { 
              width: 50px; 
              height: 32px; 
              position: relative;
              vertical-align: middle;
            }
            .activity-band { 
              height: 5px; 
              margin: 2px 0;
              border-radius: 2px;
            }
            .band-seedling { 
              background: #60a5fa; 
            }
            .band-sowing { 
              background: #4ade80; 
            }
            .band-harvest { 
              background: #fbbf24; 
            }
            .group-header { 
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 0 32px 12px 32px;
            }
            .group-accent {
              width: 4px;
              height: 24px;
              background: linear-gradient(180deg, #22c55e, #16a34a);
              border-radius: 2px;
            }
            .group-title {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
              margin: 0;
            }
            .content-wrapper {
              padding: 0 32px 32px 32px;
            }
            @media print {
              body { margin: 0; padding: 0; font-size: 10px; }
              .header { page-break-after: avoid; }
              .legend { page-break-after: avoid; }
              .group-header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <span style="font-size: 28px;">📅</span>
              <div>
                <div class="title">Odlingskalender${yearPlanText}</div>
                <div class="subtitle">Skapad: ${currentDate}</div>
              </div>
            </div>
          </div>
          
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #60a5fa;"></div>
              <span style="color: #374151; font-weight: 500;">Förkultiveras inomhus</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #4ade80;"></div>
              <span style="color: #374151; font-weight: 500;">Direktsås ute</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #fbbf24;"></div>
              <span style="color: #374151; font-weight: 500;">Skördas</span>
            </div>
            <div class="legend-item">
              <span style="font-size: 16px;">📍</span>
              <span style="color: #374151; font-weight: 500;">Planterad</span>
            </div>
            <div class="legend-item">
              <span style="font-size: 16px;">🌾</span>
              <span style="color: #374151; font-weight: 500;">Skördad</span>
            </div>
          </div>
          
          <div class="content-wrapper">
          ${Object.entries(groupedPlants).map(([groupName, groupPlants]) => `
            ${groupBy !== 'none' ? `
            <div class="group-header">
              <div class="group-accent"></div>
              <h3 class="group-title">${groupBy === 'bed' ? '📦' : '🏷️'} ${groupName}</h3>
            </div>
            ` : ''}
            <table class="calendar-table">
              <thead>
                <tr>
                  <th class="plant-name">Växt</th>
                  ${MONTHS.map((month, index) => {
                    const isCurrentMonth = index + 1 === currentMonth;
                    return `<th style="${isCurrentMonth ? 'background: linear-gradient(180deg, #bbf7d0, #86efac); border: 2px solid #22c55e;' : ''}">${month}</th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${groupPlants.map((plant, plantIdx) => `
                  <tr style="background: ${plantIdx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
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
                      
                      let cellContent = '';
                      if (isSeedling) cellContent += '<div class="activity-band band-seedling"></div>';
                      if (isSowing) cellContent += '<div class="activity-band band-sowing"></div>';
                      if (isHarvest) cellContent += '<div class="activity-band band-harvest"></div>';
                      if (isPlantedMonth) cellContent += '<span style="font-size: 14px;">📍</span>';
                      if (isHarvestedMonth) cellContent += '<span style="font-size: 14px;">🌾</span>';
                      
                      return `<td class="month-cell">${cellContent || ''}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
          </div>
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
    const currentMonth = new Date().getMonth() + 1;
    
    const element = document.createElement('div');
    element.innerHTML = `
      <style>
        .pdf-cal-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .pdf-cal-table th, .pdf-cal-table td { padding: 8px 6px; font-size: 10px; page-break-inside: avoid; }
        .pdf-cal-table td { text-align: center; border-right: 1px solid #e5e7eb; }
        .pdf-cal-table thead { display: table-header-group; page-break-inside: avoid; page-break-after: avoid; }
        .pdf-cal-table tbody { display: table-row-group; }
        .pdf-cal-table tr { page-break-inside: avoid; border-bottom: 1px solid #e5e7eb; }
        .pdf-cal-table tbody tr:nth-child(even) { background: #f9fafb; }
        .pdf-cal-table tbody tr:hover { background: #f0fdf4; }
        .pdf-group-header { background: linear-gradient(90deg, #dcfce7, #bbf7d0); font-size: 12px; text-align: left; vertical-align: middle; padding: 10px 12px; font-weight: 600; color: #166534; border-bottom: 2px solid #86efac; }
        .pdf-table-header { background: linear-gradient(180deg, #dcfce7, #bbf7d0); color: #166534; font-weight: 600; text-align: center; border-right: 1px solid #86efac; }
        .pdf-plant-name { background: linear-gradient(180deg, #f0fdf4, #ecfdf5); text-align: left; font-weight: 600; min-width: 150px; max-width: 150px; width: 150px; padding: 8px 12px; border-right: 2px solid #86efac; color: #166534; }
        .pdf-legend-item { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: white; border: 1px solid #d1d5db; border-radius: 6px; font-size: 11px; margin: 4px; }
      </style>
      <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 0; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%); padding: 24px 32px; margin: 0 0 24px 0;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
            <span style="font-size: 28px;">📅</span>
            <div>
              <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.025em;">Odlingskalender${yearPlanText}</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 4px 0 0 0;">Skapad: ${currentDate}</p>
            </div>
          </div>
        </div>
        
        <!-- Legend -->
        <div style="margin: 0 32px 24px 32px; padding: 16px; background: linear-gradient(90deg, #f0fdf4, #ecfdf5); border-radius: 12px; border: 1px solid #bbf7d0; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
          <div class="pdf-legend-item">
            <div style="width: 14px; height: 14px; border-radius: 3px; background: #60a5fa;"></div>
            <span style="color: #374151; font-weight: 500;">Förkultiveras inomhus</span>
          </div>
          <div class="pdf-legend-item">
            <div style="width: 14px; height: 14px; border-radius: 3px; background: #4ade80;"></div>
            <span style="color: #374151; font-weight: 500;">Direktsås ute</span>
          </div>
          <div class="pdf-legend-item">
            <div style="width: 14px; height: 14px; border-radius: 3px; background: #fbbf24;"></div>
            <span style="color: #374151; font-weight: 500;">Skördas</span>
          </div>
          <div class="pdf-legend-item">
            <span style="font-size: 16px;">📍</span>
            <span style="color: #374151; font-weight: 500;">Planterad</span>
          </div>
          <div class="pdf-legend-item">
            <span style="font-size: 16px;">🌾</span>
            <span style="color: #374151; font-weight: 500;">Skördad</span>
          </div>
        </div>
        
        <!-- Tables -->
        <div style="padding: 0 32px 32px 32px;">
        ${Object.entries(groupedPlants).map(([groupName, groupPlants]) => `
          <div style="margin-bottom: 32px;">
            ${groupBy !== 'none' ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <div style="width: 4px; height: 24px; background: linear-gradient(180deg, #22c55e, #16a34a); border-radius: 2px;"></div>
              <h3 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0;">${groupBy === 'bed' ? '📦' : '🏷️'} ${groupName}</h3>
            </div>
            ` : ''}
            <table class="pdf-cal-table">
              <thead>
                <tr>
                  <th class="pdf-plant-name">Växt</th>
                  ${MONTHS.map((month, index) => {
                    const isCurrentMonth = index + 1 === currentMonth;
                    return `<th class="pdf-table-header" style="${isCurrentMonth ? 'background: linear-gradient(180deg, #bbf7d0, #86efac); border: 2px solid #22c55e;' : ''}">${month}</th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
                ${groupPlants.map((plant, plantIdx) => `
                <tr style="background: ${plantIdx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                  <td class="pdf-plant-name" style="vertical-align: middle;">${plant.name || plant.id}</td>
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
                    
                    let cellContent = '';
                    if (isSeedling) cellContent += '<div style="background: #60a5fa; height: 5px; margin: 2px 0; border-radius: 2px;"></div>';
                    if (isSowing) cellContent += '<div style="background: #4ade80; height: 5px; margin: 2px 0; border-radius: 2px;"></div>';
                    if (isHarvest) cellContent += '<div style="background: #fbbf24; height: 5px; margin: 2px 0; border-radius: 2px;"></div>';
                    if (isPlantedMonth) cellContent += '<span style="font-size: 14px;">📍</span>';
                    if (isHarvestedMonth) cellContent += '<span style="font-size: 14px;">🌾</span>';
                    
                    return `<td style="padding: 4px; text-align: center; min-width: 50px; height: 32px; vertical-align: middle; position: relative;">${cellContent || ''}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        </div>
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

