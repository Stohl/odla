import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import html2pdf from 'html2pdf.js';

const GardenDesigner = ({ beds, setBeds, designName, orientation }) => {
  const [selected, setSelected] = useState(null);
  const [savedBeds, setSavedBeds] = useState([]);
  const [showBedSelector, setShowBedSelector] = useState(false);
  const [yearPlans, setYearPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plantLookup, setPlantLookup] = useState({});
  const stageRef = useRef(null);

  // Ladda sparade bäddar från BedManager och håll dem synkade
  useEffect(() => {
    const loadBeds = () => {
      const saved = localStorage.getItem('myGardenBeds');
      if (saved) {
        try {
          setSavedBeds(JSON.parse(saved));
        } catch (error) {
          console.error('Kunde inte ladda sparade bäddar:', error);
        }
      } else {
        setSavedBeds([]);
      }
    };

    loadBeds();

    const handleUpdate = (e) => {
      if (!e || e.key === 'myGardenBeds') {
        loadBeds();
      }
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('myGardenBeds-updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('myGardenBeds-updated', handleUpdate);
    };
  }, []);

  // När sparade odlingsplatser ändras: uppdatera namn/typ på instanser som härstammar från dem
  useEffect(() => {
    if (!Array.isArray(savedBeds) || savedBeds.length === 0) return;

    setBeds((prev) =>
      prev.map((instance) => {
        if (!instance.savedBedId) return instance;
        const source = savedBeds.find((s) => s.id === instance.savedBedId);
        if (!source) return instance; // källan raderad, behåll instansen orörd
        // Uppdatera bara namn/typ; behåll position och storlek i designen
        if (instance.name !== source.name || instance.type !== (source.type || 'bed')) {
          return {
            ...instance,
            name: source.name,
            type: source.type || 'bed',
          };
        }
        return instance;
      })
    );
  }, [savedBeds, setBeds]);

  // Ladda och lyssna på årsplaner
  useEffect(() => {
    const loadPlans = () => {
      const saved = localStorage.getItem('yearPlans');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setYearPlans(data.plans || {});
          // Om ingen plan vald, välj aktiv eller första
          if (!selectedPlan) {
            setSelectedPlan(data.activePlan || Object.keys(data.plans || {})[0] || '');
          }
        } catch (e) {
          console.error('Kunde inte ladda årsplaner:', e);
        }
      } else {
        setYearPlans({});
      }
    };

    loadPlans();
    const handler = (e) => {
      if (!e || e.key === 'yearPlans' || e.type === 'yearPlans-updated') {
        loadPlans();
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('yearPlans-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('yearPlans-updated', handler);
    };
  }, [selectedPlan]);

  // Canvas dimensioner baserat på orientering
  const canvasWidth = orientation === 'landscape' ? 1100 : 800;
  const canvasHeight = orientation === 'landscape' ? 800 : 1100;

  // Ladda växtnamn för export så att vi kan visa namn istället för ID
  useEffect(() => {
    let isMounted = true;

    const loadPlants = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}fron_data.json`);
        if (!response.ok) {
          throw new Error('Kunde inte ladda växtdata');
        }
        const data = await response.json();
        if (!isMounted) return;

        const map = {};
        data.forEach((plant) => {
          if (!plant?.id) return;
          const key = String(plant.id);
          map[key] = plant.name || key;
        });
        setPlantLookup(map);
      } catch (error) {
        console.error('Kunde inte ladda växtnamn för export:', error);
      }
    };

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  // Lägg till från sparade bäddar
  const addFromSaved = (savedBed) => {
    const isPot = savedBed.type === 'pot';
    const newBed = {
      id: Date.now(),
      name: savedBed.name,
      type: savedBed.type || 'bed',
      x: 50,
      y: 50,
      width: isPot ? 100 : 200,  // Krukor får mindre default-storlek
      height: isPot ? 100 : 100,
      radius: isPot ? 50 : undefined, // Radie för cirklar
      savedBedId: savedBed.id, // Referens till sparad bädd
    };

    setBeds([...beds, newBed]);
    setSelected(newBed.id);
    setShowBedSelector(false);
  };

  const addDesignRectangle = () => {
    const timestamp = Date.now();
    const count = beds.filter((b) => b.type === 'shape').length + 1;
    const newShape = {
      id: timestamp,
      name: `Rektangel ${count}`,
      type: 'shape',
      x: 80,
      y: 80,
      width: 200,
      height: 120,
      radius: undefined,
      savedBedId: null,
    };

    setBeds([...beds, newShape]);
    setSelected(newShape.id);
  };

  // Flytta bädd
  const handleMove = (id, x, y) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === id ? { ...b, x, y } : b))
    );
  };

  // Ta bort vald bädd
  const deleteSelected = () => {
    if (!selected) {
      alert('Välj en bädd först');
      return;
    }

    if (!confirm('Är du säker på att du vill ta bort denna bädd?')) {
      return;
    }

    setBeds(beds.filter((b) => b.id !== selected));
    setSelected(null);
  };

  // Redigera namn på vald bädd
  const editSelected = () => {
    if (!selected) {
      alert('Välj en bädd först');
      return;
    }

    const bed = beds.find((b) => b.id === selected);
    if (!bed) return;

    const newName = prompt('Nytt namn:', bed.name);
    if (!newName || !newName.trim()) return;

    setBeds((prev) =>
      prev.map((b) => (b.id === selected ? { ...b, name: newName.trim() } : b))
    );
  };

  const handleSelectedNumericChange = (field) => (event) => {
    if (!selected) return;
    const rawValue = event.target.value;
    if (rawValue === '') return;

    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue)) return;

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== selected) return b;

        if (field === 'x' || field === 'y') {
          return { ...b, [field]: numericValue };
        }

        if (numericValue <= 0) {
          return b;
        }

        if (field === 'width') {
          if (b.type === 'pot') {
            const diameter = numericValue;
            const radius = diameter / 2;
            return { ...b, width: diameter, height: diameter, radius };
          }
          return { ...b, width: numericValue };
        }

        if (field === 'height') {
          if (b.type === 'pot') {
            const diameter = numericValue;
            const radius = diameter / 2;
            return { ...b, width: diameter, height: diameter, radius };
          }
          return { ...b, height: numericValue };
        }

        return b;
      })
    );
  };

  // Exportera som PNG
  const exportAsPNG = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `tradgard-${designName}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = uri;
    link.click();
  };

  const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const resolvePlantName = (plantId) => {
    if (plantId === null || plantId === undefined) return '';
    const key = String(plantId);
    return plantLookup[key] || plantId;
  };

  const getBedPlantNames = (plan, bedId) => {
    if (!plan?.bedPlants) return [];
    const possibleKeys = [bedId, String(bedId)];
    for (const key of possibleKeys) {
      if (Array.isArray(plan.bedPlants[key])) {
        return plan.bedPlants[key].map((id) => resolvePlantName(id));
      }
    }
    return [];
  };

  // Skriv ut design
  const printDesign = () => {
    const printWindow = window.open('', '_blank');
    const canvas = stageRef.current.toDataURL();
    const plan = selectedPlan && yearPlans[selectedPlan] ? yearPlans[selectedPlan] : null;

    // Bygg tabell för bäddar/växter från vald plan
    let bedsOrder = savedBeds; // använd sparad ordning
    const bedIdToName = Object.fromEntries(savedBeds.map(b => [b.id, b.name]));
    const planBedIds = plan ? Object.keys(plan.bedPlants || {}) : [];
    // Begränsa till bäddar som finns i plan
    bedsOrder = bedsOrder.filter(b => planBedIds.includes(String(b.id)) || planBedIds.includes(b.id));
    const headers = bedsOrder.map(b => bedIdToName[b.id] || b.name);
    const columns = bedsOrder.map(b => getBedPlantNames(plan, b.id));
    const maxRows = columns.reduce((m, col) => Math.max(m, col.length), 0);
    const tableHtml = plan && bedsOrder.length > 0 ? `
      <style>
        .gd-print-table { border-collapse: collapse; border-spacing: 0; font-size: 12px; }
        .gd-print-table th, .gd-print-table td { border: 0.5px solid #94a3b8; padding: 4px 6px; line-height: 1.1; background: #ffffff; }
        .gd-print-table th { border: 1px solid #64748b; background: #f1f5f9; vertical-align: middle; text-align: left; white-space: nowrap; }
        @media print { .gd-print-table th, .gd-print-table td { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      <div style="margin-top:16px; text-align:left;">
        <h3 style="font-size:16px; color:#2d6a4f; margin:0 0 6px 0;">Plantering per odlingsplats – ${selectedPlan}</h3>
        <table class="gd-print-table">
          <thead>
            <tr>
              ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Array.from({length: maxRows}).map((_, rIdx) => `
              <tr>
                ${columns.map(col => `<td>${escapeHtml(col[rIdx] ? col[rIdx] : '')}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trädgårdsdesign - ${designName}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              text-align: center;
            }
            .header { 
              margin-bottom: 20px; 
              border-bottom: 2px solid #2d6a4f; 
              padding-bottom: 10px; 
            }
            .design-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2d6a4f; 
              margin-bottom: 5px; 
            }
            .date { 
              color: #666; 
              font-size: 14px; 
            }
            .canvas-container { 
              display: inline-block; 
              border: 1px solid #ccc; 
              margin: 20px 0; 
            }
            .legend { 
              margin-top: 20px; 
              text-align: left; 
              max-width: 600px; 
              margin-left: auto; 
              margin-right: auto; 
            }
            .legend h3 { 
              color: #2d6a4f; 
              border-bottom: 1px solid #2d6a4f; 
              padding-bottom: 5px; 
            }
            .legend-item { 
              margin: 5px 0; 
              display: flex; 
              align-items: center; 
              gap: 10px; 
            }
            .legend-icon { 
              width: 20px; 
              height: 15px; 
              border: 1px solid #2d6a4f; 
            }
            .legend-icon.pot { 
              border-radius: 50%; 
              background: #f4a261; 
            }
            .legend-icon.bed { 
              background: #d8f3dc; 
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .header { page-break-after: avoid; }
              .canvas-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="design-name">${designName}</div>
            <div class="date">Skapad: ${new Date().toLocaleDateString('sv-SE')}</div>
          </div>
          
          <div class="canvas-container">
            <img src="${canvas}" alt="Trädgårdsdesign" style="max-width: 100%; height: auto;" />
          </div>
          
          ${tableHtml}
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

  // Exportera som PDF
  const exportAsPDF = () => {
    const canvas = stageRef.current.toDataURL();
    const plan = selectedPlan && yearPlans[selectedPlan] ? yearPlans[selectedPlan] : null;
    const bedIdToName = Object.fromEntries(savedBeds.map(b => [b.id, b.name]));
    let bedsOrder = savedBeds;
    const planBedIds = plan ? Object.keys(plan.bedPlants || {}) : [];
    bedsOrder = bedsOrder.filter(b => planBedIds.includes(String(b.id)) || planBedIds.includes(b.id));
    const headers = bedsOrder.map(b => bedIdToName[b.id] || b.name);
    const columns = bedsOrder.map(b => getBedPlantNames(plan, b.id));
    const maxRows = columns.reduce((m, col) => Math.max(m, col.length), 0);
    const tableHtml = plan && bedsOrder.length > 0 ? `
      <style>
        .gd-print-table { border-collapse: collapse; border-spacing: 0; font-size: 12px; }
        .gd-print-table th, .gd-print-table td { border: 0.5px solid #94a3b8; padding: 4px 6px; line-height: 1.1; background: #ffffff; }
        .gd-print-table th { border: 1px solid #64748b; background: #f1f5f9; vertical-align: middle; text-align: left; white-space: nowrap; }
        @media print { .gd-print-table th, .gd-print-table td { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      <div style=\"margin-top:16px; text-align:left;\">
        <h3 style=\"font-size:16px; color:#2d6a4f; margin:0 0 6px 0;\">Plantering per odlingsplats – ${selectedPlan}</h3>
        <table class=\"gd-print-table\" style=\"width:auto;\">
          <thead>
            <tr>
              ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Array.from({length: maxRows}).map((_, rIdx) => `
              <tr>
                ${columns.map(col => `<td>${escapeHtml(col[rIdx] ? col[rIdx] : '')}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';
    
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <div style="margin-bottom: 20px; border-bottom: 2px solid #2d6a4f; padding-bottom: 10px;">
          <div style="font-size: 24px; font-weight: bold; color: #2d6a4f; margin-bottom: 5px;">${designName}</div>
          <div style="color: #666; font-size: 14px;">Skapad: ${new Date().toLocaleDateString('sv-SE')}</div>
        </div>
        
        <div style="display: inline-block; border: 1px solid #ccc; margin: 20px 0;">
          <img src="${canvas}" alt="Trädgårdsdesign" style="max-width: 100%; height: auto;" />
        </div>
        ${tableHtml}
      </div>
    `;
    
    const opt = {
      margin: 0.5,
      filename: `tradgard-${designName}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Hitta vald bädd
  const selectedBed = beds.find((b) => b.id === selected);
  const selectedBedX = selectedBed?.x ?? 0;
  const selectedBedY = selectedBed?.y ?? 0;
  const selectedBedWidth = selectedBed
    ? selectedBed.type === 'pot'
      ? selectedBed.radius != null
        ? selectedBed.radius * 2
        : selectedBed.width ?? 0
      : selectedBed.width ?? 0
    : 0;
  const selectedBedHeight = selectedBed
    ? selectedBed.type === 'pot'
      ? selectedBed.radius != null
        ? selectedBed.radius * 2
        : selectedBed.height ?? selectedBed.width ?? 0
      : selectedBed.height ?? 0
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Kontroller */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        {/* Årsplan-väljare */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-earth-700">Årsplan:</label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-3 py-2 border-2 border-earth-200 rounded-lg bg-white focus:outline-none focus:border-plant-400 text-sm"
          >
            <option value="">Ingen</option>
            {Object.keys(yearPlans).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBedSelector(!showBedSelector)}
            className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
          >
            {showBedSelector ? '− Stäng väljare' : '📋 Lägg till från odlingsplatser'}
          </button>
          <button
            onClick={addDesignRectangle}
            className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold"
          >
            ➕ Rektangel
          </button>
        </div>

        {selected && (
          <>
            <button
              onClick={editSelected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              ✏️ Ändra namn
            </button>

            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              🗑 Ta bort vald
            </button>
          </>
        )}

        <button
          onClick={exportAsPNG}
          className="px-4 py-2 bg-earth-500 text-white rounded-lg hover:bg-earth-600 transition-colors font-semibold"
        >
          📤 PNG
        </button>

        <button
          onClick={exportAsPDF}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
        >
          📄 PDF
        </button>

        <button
          onClick={printDesign}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
        >
          🖨️ Skriv ut
        </button>

        <span className="ml-auto text-earth-600 font-semibold">
          Totalt: {beds.length} platser
        </span>
      </div>

      {/* Info om vald bädd */}
      {selectedBed && (
        <div className="mb-4 p-4 bg-plant-50 border-2 border-plant-300 rounded-lg">
          <h3 className="font-bold text-plant-800 mb-2">Vald bädd: {selectedBed.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-earth-700">
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">X-position (px)</span>
              <input
                type="number"
                value={Number.isFinite(selectedBedX) ? selectedBedX : 0}
                onChange={handleSelectedNumericChange('x')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">Y-position (px)</span>
              <input
                type="number"
                value={Number.isFinite(selectedBedY) ? selectedBedY : 0}
                onChange={handleSelectedNumericChange('y')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">
                {selectedBed.type === 'pot' ? 'Diameter (px)' : 'Bredd (px)'}
              </span>
              <input
                type="number"
                min="1"
                value={Number.isFinite(selectedBedWidth) ? selectedBedWidth : 0}
                onChange={handleSelectedNumericChange('width')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">
                {selectedBed.type === 'pot' ? 'Diameter (px)' : 'Höjd (px)'}
              </span>
              <input
                type="number"
                min="1"
                value={Number.isFinite(selectedBedHeight) ? selectedBedHeight : 0}
                onChange={handleSelectedNumericChange('height')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
            </label>
          </div>
        </div>
      )}

      {/* Bädväljare */}
      {showBedSelector && (
        <div className="mb-4 p-4 bg-plant-50 border-2 border-plant-300 rounded-lg">
          {savedBeds.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-earth-700 font-semibold mb-2">Inga odlingsplatser skapade ännu</p>
              <p className="text-earth-600 text-sm">
                Gå till fliken "🌿 Odlingsplatser" för att skapa dina odlingsplatser först
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-earth-800 mb-3">Välj från dina sparade odlingsplatser:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {savedBeds.map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => addFromSaved(bed)}
                    className="p-3 border-2 border-earth-200 rounded-lg hover:border-plant-400 hover:bg-white transition-colors text-left"
                  >
                    <div className="font-semibold text-earth-800 text-sm">{bed.name}</div>
                    {bed.description && (
                      <div className="text-xs text-earth-500 mt-1">
                        {bed.description.substring(0, 30)}...
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <span className="font-semibold">💡 Tips:</span> Klicka på en bädd för att välja den och dra för att flytta den. 
        Använd knapparna ovanför kartan för att byta namn eller ta bort.
      </div>

      {/* Canvas */}
      <div className="flex justify-center overflow-auto bg-earth-50 p-8 rounded-lg">
        <div className="shadow-2xl">
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight}
            className="bg-white"
            style={{ border: '2px solid #d6d3d1', borderRadius: '4px' }}
          >
            <Layer>
              {/* Rita odlingsbäddar och krukor */}
              {beds.map((bed) => {
                const isPot = bed.type === 'pot';
                const isDesignShape = bed.type === 'shape';
                const radius = bed.radius || 50;

                return (
                  <React.Fragment key={bed.id}>
                    {isPot ? (
                      // Rita kruka som cirkel
                      <Circle
                        x={bed.x + radius}
                        y={bed.y + radius}
                        radius={radius}
                        fill="#f4a261"
                        stroke={selected === bed.id ? '#d08c60' : '#e76f51'}
                        strokeWidth={selected === bed.id ? 4 : 2}
                        draggable
                        shadowBlur={selected === bed.id ? 10 : 5}
                        shadowColor="rgba(0,0,0,0.3)"
                        onClick={() => setSelected(bed.id)}
                        onTap={() => setSelected(bed.id)}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x() - radius, e.target.y() - radius)}
                      />
                    ) : (
                      // Rita bädd som rektangel
                      <Rect
                        x={bed.x}
                        y={bed.y}
                        width={bed.width}
                        height={bed.height}
                        fill={isDesignShape ? '#fde68a' : '#d8f3dc'}
                        stroke={
                          selected === bed.id
                            ? isDesignShape
                              ? '#b45309'
                              : '#1b4332'
                            : isDesignShape
                            ? '#f59e0b'
                            : '#2d6a4f'
                        }
                        strokeWidth={selected === bed.id ? 4 : 2}
                        draggable
                        shadowBlur={selected === bed.id ? 10 : 5}
                        shadowColor="rgba(0,0,0,0.3)"
                        onClick={() => setSelected(bed.id)}
                        onTap={() => setSelected(bed.id)}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x(), e.target.y())}
                      />
                    )}
                    
                    <Text
                      x={isPot ? bed.x + radius : bed.x + 8}
                      y={isPot ? bed.y + radius - 8 : bed.y + 8}
                      text={bed.name}
                      fontSize={16}
                      fontStyle="bold"
                      fill={
                        isPot
                          ? '#8b4513'
                          : isDesignShape
                          ? '#92400e'
                          : '#1b4332'
                      }
                      listening={false}
                      align={isPot ? 'center' : 'left'}
                      offsetX={isPot ? radius - 8 : 0}
                    />
                    
                    {/* Visa mått om vald */}
                    {selected === bed.id && (
                      <Text
                        x={isPot ? bed.x + radius : bed.x + 8}
                        y={isPot ? bed.y + radius * 2 - 20 : bed.y + bed.height - 24}
                        text={isPot ? `Radie: ${radius} px` : `${bed.width} × ${bed.height} px`}
                        fontSize={12}
                        fill="#52796f"
                        listening={false}
                        align={isPot ? 'center' : 'left'}
                        offsetX={isPot ? radius - 8 : 0}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Lista över odlingsplatser */}
      {beds.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-earth-800 mb-3">Dina odlingsplatser</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {beds.map((bed) => {
              const isPot = bed.type === 'pot';
              const isDesignShape = bed.type === 'shape';
              const icon = isPot ? '🪴' : isDesignShape ? '⬛' : '▭';
              const sizeText = isPot
                ? `Radie: ${bed.radius || 50}px`
                : `${bed.width}×${bed.height}px`;

              return (
                <div
                  key={bed.id}
                  onClick={() => setSelected(bed.id)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selected === bed.id
                      ? 'border-plant-500 bg-plant-50'
                      : 'border-earth-200 hover:border-plant-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <div className="font-semibold text-earth-800">{bed.name}</div>
                  </div>
                  <div className="text-xs text-earth-600 mt-1">
                    Position: ({Math.round(bed.x)}, {Math.round(bed.y)}) • {sizeText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tom state */}
      {beds.length === 0 && (
        <div className="mt-6 p-12 text-center bg-earth-50 rounded-lg">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-earth-800 mb-2">
            Inga odlingsplatser ännu
          </h3>
          <p className="text-earth-600">
            Klicka på "📋 Lägg till bädd från mina bäddar" för att komma igång!
          </p>
        </div>
      )}
    </div>
  );
};

export default GardenDesigner;
