import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import html2pdf from 'html2pdf.js';

const GardenDesigner = ({ beds, setBeds, designName, orientation, scale, setScale, bgColor, setBgColor }) => {
  const [selected, setSelected] = useState(null);
  const [savedBeds, setSavedBeds] = useState([]);
  const [showBedSelector, setShowBedSelector] = useState(false);
  const [yearPlans, setYearPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plantLookup, setPlantLookup] = useState({});
  const stageRef = useRef(null);
  
  // Lokal state för input-värden för att tillåta rensning
  const [inputValues, setInputValues] = useState({
    widthPx: '',
    widthM: '',
    heightPx: '',
    heightM: ''
  });

  // Använd props för skala och bakgrundsfärg (sparas per design)
  const pixelsPerMeter = scale ?? 20;
  const canvasBgColor = bgColor ?? '#cce8b5';

  const getDefaultColor = (type) => {
    if (type === 'pot') return '#f4a261';
    if (type === 'shape') return '#fde68a';
    return '#d8f3dc';
  };

  const getDefaultStrokeColor = (type) => {
    if (type === 'pot') return '#e76f51';
    if (type === 'shape') return '#b45309';
    return '#2d6a4f';
  };

  // Konvertera pixlar till meter
  const pixelsToMeters = (pixels) => {
    if (!pixelsPerMeter || pixelsPerMeter <= 0) return 0;
    return pixels / pixelsPerMeter;
  };

  // Synka inputValues när selected ändras
  useEffect(() => {
    const bed = beds.find((b) => b.id === selected);
    if (bed) {
      const width = bed.type === 'pot' 
        ? (bed.radius != null ? bed.radius * 2 : bed.width ?? 0)
        : (bed.width ?? 0);
      const height = bed.type === 'pot'
        ? (bed.radius != null ? bed.radius * 2 : bed.height ?? bed.width ?? 0)
        : (bed.height ?? 0);
      
      setInputValues({
        widthPx: Number.isFinite(width) ? width.toString() : '',
        widthM: Number.isFinite(width) ? pixelsToMeters(width).toFixed(2) : '',
        heightPx: Number.isFinite(height) ? height.toString() : '',
        heightM: Number.isFinite(height) ? pixelsToMeters(height).toFixed(2) : ''
      });
    } else {
      setInputValues({
        widthPx: '',
        widthM: '',
        heightPx: '',
        heightM: ''
      });
    }
  }, [selected, beds, pixelsPerMeter]);

  // Formatera meter med 2 decimaler
  const formatMeters = (meters) => {
    if (meters === 0) return '0 m';
    if (meters < 0.01) return `${(meters * 100).toFixed(1)} cm`;
    return `${meters.toFixed(2)} m`;
  };

  // Normalisera textPosition (hantera bakåtkompatibilitet)
  const normalizeTextPosition = (textPosition) => {
    if (!textPosition) return 'middle-center';
    // Mappa gamla värden till nya
    const oldToNew = {
      'center': 'middle-center',
      'left': 'middle-left',
      'right': 'middle-right',
      'top': 'top-center',
      'bottom': 'bottom-center'
    };
    return oldToNew[textPosition] || textPosition;
  };

  // Hämta horizontal och vertical delar av textPosition
  const getTextPositionParts = (textPosition) => {
    const normalized = normalizeTextPosition(textPosition);
    const parts = normalized.split('-');
    return {
      horizontal: parts[1] || 'center', // left, center, right
      vertical: parts[0] || 'middle' // top, middle, bottom
    };
  };


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
        const sourceType = source.type || 'bed';
        const sourceColor = source.color || getDefaultColor(sourceType);

        const sourceStroke = source.strokeColor || getDefaultStrokeColor(sourceType);

        if (
          instance.name !== source.name ||
          instance.type !== sourceType ||
          instance.color !== sourceColor ||
          instance.strokeColor !== sourceStroke
        ) {
          return {
            ...instance,
            name: source.name,
            type: sourceType,
            color: sourceColor,
            strokeColor: sourceStroke,
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

        // Lägg till customPlants från localStorage
        try {
          const savedMyPlants = localStorage.getItem('myPlants');
          if (savedMyPlants) {
            const myPlants = JSON.parse(savedMyPlants);
            const customPlants = myPlants.customPlants || {};
            Object.values(customPlants).forEach((plant) => {
              if (plant?.id && plant?.name) {
                const key = String(plant.id);
                map[key] = plant.name;
              }
            });
          }
        } catch (e) {
          console.error('Kunde inte ladda customPlants:', e);
        }

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

  const selectBed = (id, bringToFront = true) => {
    if (!id) return;

    if (bringToFront) {
      setBeds((prev) => {
        const index = prev.findIndex((b) => b.id === id);
        if (index === -1) return prev;
        if (index === prev.length - 1) return prev;
        const updated = [...prev];
        const [item] = updated.splice(index, 1);
        updated.push(item);
        return updated;
      });
    }

    setSelected(id);
  };

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
      color: savedBed.color || getDefaultColor(savedBed.type || 'bed'),
      strokeColor: savedBed.strokeColor || getDefaultStrokeColor(savedBed.type || 'bed'),
    };

    setBeds((prev) => [...prev, newBed]);
    selectBed(newBed.id, false);
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
      color: getDefaultColor('shape'),
      strokeColor: getDefaultStrokeColor('shape'),
    };

    setBeds((prev) => [...prev, newShape]);
    selectBed(newShape.id, false);
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

    setBeds((prev) => prev.filter((b) => b.id !== selected));
    setSelected(null);
  };

  const handleSelectedNumericChange = (field) => (event) => {
    if (!selected) return;
    const rawValue = event.target.value;
    
    // Tillåt tomma värden temporärt så att användaren kan rensa fältet
    if (rawValue === '' || rawValue === '-') {
      // Uppdatera lokal state för att visa tomt värde
      if (field === 'width') {
        setInputValues(prev => ({ ...prev, widthPx: '' }));
      } else if (field === 'height') {
        setInputValues(prev => ({ ...prev, heightPx: '' }));
      }
      return;
    }

    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue)) return;

    // Uppdatera lokal state
    if (field === 'width') {
      setInputValues(prev => ({ ...prev, widthPx: rawValue, widthM: pixelsToMeters(numericValue).toFixed(2) }));
    } else if (field === 'height') {
      setInputValues(prev => ({ ...prev, heightPx: rawValue, heightM: pixelsToMeters(numericValue).toFixed(2) }));
    }

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

  // Hantera ändringar i meter-input
  const handleSelectedMeterChange = (field) => (event) => {
    if (!selected) return;
    const rawValue = event.target.value;
    
    // Tillåt tomma värden temporärt så att användaren kan rensa fältet
    if (rawValue === '' || rawValue === '-') {
      // Uppdatera lokal state för att visa tomt värde
      if (field === 'width') {
        setInputValues(prev => ({ ...prev, widthM: '' }));
      } else if (field === 'height') {
        setInputValues(prev => ({ ...prev, heightM: '' }));
      }
      return;
    }
    
    const meterValue = Number(rawValue);
    if (!Number.isFinite(meterValue) || meterValue <= 0) return;
    
    // Konvertera meter till pixlar
    const pixelValue = meterValue * pixelsPerMeter;

    // Uppdatera lokal state
    if (field === 'width') {
      setInputValues(prev => ({ ...prev, widthM: rawValue, widthPx: Math.round(pixelValue).toString() }));
    } else if (field === 'height') {
      setInputValues(prev => ({ ...prev, heightM: rawValue, heightPx: Math.round(pixelValue).toString() }));
    }

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== selected) return b;

        if (field === 'width') {
          if (b.type === 'pot') {
            const diameter = pixelValue;
            const radius = diameter / 2;
            return { ...b, width: diameter, height: diameter, radius };
          }
          return { ...b, width: pixelValue };
        }

        if (field === 'height') {
          if (b.type === 'pot') {
            const diameter = pixelValue;
            const radius = diameter / 2;
            return { ...b, width: diameter, height: diameter, radius };
          }
          return { ...b, height: pixelValue };
        }

        return b;
      })
    );
  };

  const handleSelectedColorChange = (kind) => (event) => {
    if (!selected) return;
    const newColor = event.target.value;

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== selected) return b;
        if (kind === 'fill') {
          return { ...b, color: newColor };
        }
        if (kind === 'stroke') {
          return { ...b, strokeColor: newColor };
        }
        return b;
      })
    );
  };

  const handleShapeNameChange = (event) => {
    if (!selected) return;
    const newName = event.target.value;

    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== selected) return b;
        if (b.type !== 'shape') return b;
        return { ...b, name: newName };
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

    // Skapa mini-header för följande sidor
    const miniHeader = (pageTitle, pageIcon) => `
      <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 100%); padding: 16px 32px; margin: 0 0 20px 0; border-radius: 0 0 12px 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${pageIcon}</span>
            <div>
              <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0;">${pageTitle}</h2>
              <p style="color: rgba(255,255,255,0.8); font-size: 11px; margin: 0;">${escapeHtml(designName)}</p>
            </div>
          </div>
          <div style="color: rgba(255,255,255,0.9); font-size: 11px;">${new Date().toLocaleDateString('sv-SE')}</div>
        </div>
      </div>
    `;

    // Skapa legenda med alla odlingsplatser - grid för bättre sidbrytning
    const legendItems = beds.map((bed, idx) => {
      const isPot = bed.type === 'pot';
      const isShape = bed.type === 'shape';
      const icon = isPot ? '🪴' : isShape ? '⬛' : '🌱';
      const typeLabel = isPot ? 'Kruka' : isShape ? 'Rektangel' : 'Odlingsbädd';
      const sizeInMeters = isPot 
        ? formatMeters(pixelsToMeters((bed.radius || 50) * 2))
        : `${formatMeters(pixelsToMeters(bed.width))} × ${formatMeters(pixelsToMeters(bed.height))}`;
      const fillColor = bed.color || getDefaultColor(bed.type);
      return `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; break-inside: avoid;">
          <span style="font-size: 18px;">${icon}</span>
          <div style="width: 20px; height: 20px; border-radius: 4px; background: ${fillColor}; border: 2px solid ${bed.strokeColor || getDefaultStrokeColor(bed.type)}; flex-shrink: 0;"></div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; color: #1f2937; font-size: 12px;">${escapeHtml(bed.name)}</div>
            <div style="color: #6b7280; font-size: 10px;">${typeLabel} • ${sizeInMeters}</div>
          </div>
        </div>
      `;
    }).join('');

    // Sida 2: Odlingsplatser
    const legendPage = beds.length > 0 ? `
      <div class="page-break">
        ${miniHeader('Odlingsplatser', '📋')}
        <div style="padding: 0 32px 32px 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(90deg, #faf5ff, #f3e8ff); border-radius: 10px; border: 1px solid #e9d5ff;">
            <span style="font-size: 16px;">🗺️</span>
            <span style="font-size: 12px; color: #7c3aed; font-weight: 600;">Totalt ${beds.length} odlingsplatser i designen</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${legendItems}
          </div>
        </div>
      </div>
    ` : '';
    
    // Sida 3: Plantering per odlingsplats
    const plantTablePage = plan && bedsOrder.length > 0 ? `
      <div class="page-break">
        ${miniHeader('Plantering per odlingsplats', '🌱')}
        <div style="padding: 0 32px 32px 32px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px 16px; background: linear-gradient(90deg, #f0fdf4, #ecfdf5); border-radius: 10px; border: 1px solid #bbf7d0;">
            <span style="font-size: 16px;">📅</span>
            <span style="font-size: 12px; color: #166534; font-weight: 600;">Årsplan: ${escapeHtml(selectedPlan)}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr>
                ${headers.map(h => `<th style="background: linear-gradient(180deg, #f0fdf4, #dcfce7); color: #166534; padding: 12px 14px; text-align: left; font-weight: 600; border-bottom: 2px solid #86efac; white-space: nowrap;">${escapeHtml(h)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${Array.from({length: maxRows}).map((_, rIdx) => `
                <tr style="background: ${rIdx % 2 === 0 ? '#ffffff' : '#f9fafb'}; break-inside: avoid;">
                  ${columns.map(col => `<td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb; color: #374151;">${escapeHtml(col[rIdx] ? col[rIdx] : '')}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';
    
    const element = document.createElement('div');
    element.innerHTML = `
      <style>
        .page-break { page-break-before: always; }
        @media print {
          .page-break { page-break-before: always; }
        }
      </style>
      <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 0; background: #ffffff;">
        
        <!-- SIDA 1: Trädgårdskarta -->
        <div>
          <!-- Header med gradient -->
          <div style="background: linear-gradient(135deg, #166534 0%, #22c55e 50%, #4ade80 100%); padding: 24px 32px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🌱</div>
              <div>
                <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${escapeHtml(designName)}</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">Trädgårdsdesign • ${new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <!-- Innehåll sida 1 -->
          <div style="padding: 16px 24px;">
            <!-- Trädgårdskarta -->
            <div style="background: #f9fafb; border-radius: 12px; padding: 10px; border: 2px solid #e5e7eb;">
              <div style="text-align: center; background: #ffffff; border-radius: 8px; padding: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <img src="${canvas}" alt="Trädgårdsdesign" style="max-width: 100%; max-height: 520px; height: auto; border-radius: 6px;" />
              </div>
            </div>
          </div>

          <!-- Footer sida 1 -->
          <div style="padding: 16px 32px; background: linear-gradient(90deg, #f9fafb, #f3f4f6); border-top: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 14px;">🌿</span>
                <span style="font-size: 11px; color: #6b7280; font-weight: 500;">Skapad med Odlingskalendern</span>
              </div>
              <div style="font-size: 10px; color: #9ca3af;">Sida 1${beds.length > 0 ? ` av ${plan && bedsOrder.length > 0 ? '3' : '2'}` : ''}</div>
            </div>
          </div>
        </div>

        ${legendPage}
        ${plantTablePage}
      </div>
    `;
    
    const opt = {
      margin: 0,
      filename: `tradgard-${designName}-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: orientation === 'landscape' ? 'landscape' : 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.page-break' }
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
          <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
            <div>
              <h3 className="font-bold text-plant-800 mb-1">
                Vald {selectedBed.type === 'shape' ? 'rektangel' : 'bädd'}: {selectedBed.name}
              </h3>
              <p className="text-xs uppercase tracking-wide text-earth-500">
                {selectedBed.type === 'pot'
                  ? 'Kruka'
                  : selectedBed.type === 'shape'
                  ? 'Designrektangel'
                  : selectedBed.savedBedId
                  ? 'Odlingsplats (från odlingsplatser)'
                  : 'Fristående bädd'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm font-semibold text-earth-700">
                <span>Fyllnad:</span>
                <input
                  type="color"
                  value={selectedBed.color || getDefaultColor(selectedBed.type)}
                  onChange={handleSelectedColorChange('fill')}
                  className="w-12 h-8 border-2 border-earth-300 rounded cursor-pointer bg-white"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-earth-700">
                <span>Kant:</span>
                <input
                  type="color"
                  value={selectedBed.strokeColor || getDefaultStrokeColor(selectedBed.type)}
                  onChange={handleSelectedColorChange('stroke')}
                  className="w-12 h-8 border-2 border-earth-300 rounded cursor-pointer bg-white"
                />
              </label>
            </div>
          </div>

          {/* Textinställningar */}
          <div className="mt-4 pt-4 border-t border-plant-200">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm font-semibold text-earth-700">
                <input
                  type="checkbox"
                  checked={selectedBed.showText !== false}
                  onChange={(e) => {
                    setBeds((prev) =>
                      prev.map((b) => {
                        if (b.id !== selected) return b;
                        return { ...b, showText: e.target.checked };
                      })
                    );
                  }}
                  className="w-4 h-4"
                />
                <span>Visa text</span>
              </label>
              {selectedBed.showText !== false && (
                <label className="flex items-center gap-2 text-sm font-semibold text-earth-700">
                  <span>Textposition:</span>
                  <select
                    value={normalizeTextPosition(selectedBed.textPosition)}
                    onChange={(e) => {
                      setBeds((prev) =>
                        prev.map((b) => {
                          if (b.id !== selected) return b;
                          return { ...b, textPosition: e.target.value };
                        })
                      );
                    }}
                    className="px-3 py-1 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 bg-white"
                  >
                    <option value="top-left">Vänster uppe</option>
                    <option value="top-center">Mitten uppe</option>
                    <option value="top-right">Höger uppe</option>
                    <option value="middle-left">Vänster mitten</option>
                    <option value="middle-center">Mitten mitten</option>
                    <option value="middle-right">Höger mitten</option>
                    <option value="bottom-left">Vänster nere</option>
                    <option value="bottom-center">Mitten nere</option>
                    <option value="bottom-right">Höger nere</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-earth-700">
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">Namn</span>
              <input
                type="text"
                value={selectedBed.name}
                onChange={handleShapeNameChange}
                disabled={selectedBed.type !== 'shape'}
                className={`mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 ${
                  selectedBed.type !== 'shape' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
              />
            </label>
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">X-position</span>
              <input
                type="number"
                value={Number.isFinite(selectedBedX) ? selectedBedX : 0}
                onChange={handleSelectedNumericChange('x')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
              <span className="text-xs text-earth-500 mt-1">
                {formatMeters(pixelsToMeters(selectedBedX))}
              </span>
            </label>
            <label className="flex flex-col">
              <span className="font-semibold text-earth-800">Y-position</span>
              <input
                type="number"
                value={Number.isFinite(selectedBedY) ? selectedBedY : 0}
                onChange={handleSelectedNumericChange('y')}
                className="mt-1 px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
              />
              <span className="text-xs text-earth-500 mt-1">
                {formatMeters(pixelsToMeters(selectedBedY))}
              </span>
            </label>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-earth-800">
                {selectedBed.type === 'pot' ? 'Diameter' : 'Bredd'}
              </span>
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col">
                  <span className="text-xs text-earth-600 mb-1">Pixlar</span>
                  <input
                    type="number"
                    min="1"
                    value={inputValues.widthPx}
                    onChange={handleSelectedNumericChange('width')}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (e.target.value === '' || !Number.isFinite(val) || val <= 0) {
                        const bed = beds.find((b) => b.id === selected);
                        const width = bed?.type === 'pot' 
                          ? (bed.radius != null ? bed.radius * 2 : bed.width ?? 0)
                          : (bed?.width ?? 0);
                        setInputValues(prev => ({ ...prev, widthPx: Number.isFinite(width) ? width.toString() : '' }));
                      }
                    }}
                    className="px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                    placeholder="0"
                  />
                </label>
                <label className="flex-1 flex flex-col">
                  <span className="text-xs text-earth-600 mb-1">Meter</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={inputValues.widthM}
                    onChange={handleSelectedMeterChange('width')}
                    onBlur={(e) => {
                      const meterVal = Number(e.target.value);
                      if (e.target.value === '' || !Number.isFinite(meterVal) || meterVal <= 0) {
                        const bed = beds.find((b) => b.id === selected);
                        const width = bed?.type === 'pot' 
                          ? (bed.radius != null ? bed.radius * 2 : bed.width ?? 0)
                          : (bed?.width ?? 0);
                        setInputValues(prev => ({ ...prev, widthM: Number.isFinite(width) ? pixelsToMeters(width).toFixed(2) : '' }));
                      }
                    }}
                    className="px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                    placeholder="0.00"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-earth-800">
                {selectedBed.type === 'pot' ? 'Diameter' : 'Höjd'}
              </span>
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col">
                  <span className="text-xs text-earth-600 mb-1">Pixlar</span>
                  <input
                    type="number"
                    min="1"
                    value={inputValues.heightPx}
                    onChange={handleSelectedNumericChange('height')}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (e.target.value === '' || !Number.isFinite(val) || val <= 0) {
                        const bed = beds.find((b) => b.id === selected);
                        const height = bed?.type === 'pot'
                          ? (bed.radius != null ? bed.radius * 2 : bed.height ?? bed.width ?? 0)
                          : (bed?.height ?? 0);
                        setInputValues(prev => ({ ...prev, heightPx: Number.isFinite(height) ? height.toString() : '' }));
                      }
                    }}
                    className="px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                    placeholder="0"
                  />
                </label>
                <label className="flex-1 flex flex-col">
                  <span className="text-xs text-earth-600 mb-1">Meter</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={inputValues.heightM}
                    onChange={handleSelectedMeterChange('height')}
                    onBlur={(e) => {
                      const meterVal = Number(e.target.value);
                      if (e.target.value === '' || !Number.isFinite(meterVal) || meterVal <= 0) {
                        const bed = beds.find((b) => b.id === selected);
                        const height = bed?.type === 'pot'
                          ? (bed.radius != null ? bed.radius * 2 : bed.height ?? bed.width ?? 0)
                          : (bed?.height ?? 0);
                        setInputValues(prev => ({ ...prev, heightM: Number.isFinite(height) ? pixelsToMeters(height).toFixed(2) : '' }));
                      }
                    }}
                    className="px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400"
                    placeholder="0.00"
                  />
                </label>
              </div>
            </div>
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
            style={{ border: '2px solid #d6d3d1', borderRadius: '4px', backgroundColor: canvasBgColor }}
          >
            <Layer>
              {/* Bakgrund */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={canvasBgColor}
                listening={false}
              />
              {/* Rita odlingsbäddar och krukor */}
              {beds.map((bed) => {
                const isPot = bed.type === 'pot';
                const isDesignShape = bed.type === 'shape';
                const radius = bed.radius || 50;
                const fillColor = bed.color || getDefaultColor(bed.type);
                const strokeColor = bed.strokeColor || getDefaultStrokeColor(bed.type);

                return (
                  <React.Fragment key={bed.id}>
                    {isPot ? (
                      // Rita kruka som cirkel
                      <Circle
                        x={bed.x + radius}
                        y={bed.y + radius}
                        radius={radius}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={selected === bed.id ? 4 : 2}
                        draggable
                        shadowBlur={selected === bed.id ? 10 : 5}
                        shadowColor="rgba(0,0,0,0.3)"
                        onClick={() => selectBed(bed.id)}
                        onTap={() => selectBed(bed.id)}
                        onDragStart={() => selectBed(bed.id)}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x() - radius, e.target.y() - radius)}
                      />
                    ) : (
                      // Rita bädd som rektangel
                      <Rect
                        x={bed.x}
                        y={bed.y}
                        width={bed.width}
                        height={bed.height}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={selected === bed.id ? 4 : 2}
                        draggable
                        shadowBlur={selected === bed.id ? 10 : 5}
                        shadowColor="rgba(0,0,0,0.3)"
                        onClick={() => selectBed(bed.id)}
                        onTap={() => selectBed(bed.id)}
                        onDragStart={() => selectBed(bed.id)}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x(), e.target.y())}
                      />
                    )}
                    
                    {bed.showText !== false && (() => {
                      const pos = getTextPositionParts(bed.textPosition);
                      const padding = 8;
                      
                      // Beräkna x-position
                      let textX;
                      if (isPot) {
                        switch (pos.horizontal) {
                          case 'left': textX = bed.x + padding; break;
                          case 'right': textX = bed.x + radius * 2 - padding; break;
                          case 'center': 
                          default: textX = bed.x + radius; break;
                        }
                      } else {
                        switch (pos.horizontal) {
                          case 'left': textX = bed.x + padding; break;
                          case 'right': textX = bed.x + bed.width - padding; break;
                          case 'center':
                          default: textX = bed.x + bed.width / 2; break;
                        }
                      }
                      
                      // Beräkna y-position
                      let textY;
                      if (isPot) {
                        switch (pos.vertical) {
                          case 'top': textY = bed.y + padding; break;
                          case 'bottom': textY = bed.y + radius * 2 - padding; break;
                          case 'middle':
                          default: textY = bed.y + radius; break;
                        }
                      } else {
                        switch (pos.vertical) {
                          case 'top': textY = bed.y + padding; break;
                          case 'bottom': textY = bed.y + bed.height - padding; break;
                          case 'middle':
                          default: textY = bed.y + bed.height / 2; break;
                        }
                      }
                      
                      // Beräkna align (horisontell justering)
                      const textAlign = pos.horizontal === 'left' ? 'left' : 
                                       pos.horizontal === 'right' ? 'right' : 'center';
                      
                      // Beräkna verticalAlign (vertikal justering)
                      const textVerticalAlign = pos.vertical === 'top' ? 'top' :
                                                pos.vertical === 'bottom' ? 'bottom' : 'middle';
                      
                      return (
                        <Text
                          x={textX}
                          y={textY}
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
                          align={textAlign}
                          verticalAlign={textVerticalAlign}
                        />
                      );
                    })()}
                    
                    {/* Visa mått om vald */}
                    {selected === bed.id && (
                      <>
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
                        <Text
                          x={isPot ? bed.x + radius : bed.x + 8}
                          y={isPot ? bed.y + radius * 2 - 8 : bed.y + bed.height - 12}
                          text={isPot 
                            ? `(${formatMeters(pixelsToMeters(radius * 2))})` 
                            : `(${formatMeters(pixelsToMeters(bed.width))} × ${formatMeters(pixelsToMeters(bed.height))})`}
                          fontSize={11}
                          fill="#52796f"
                          listening={false}
                          align={isPot ? 'center' : 'left'}
                          offsetX={isPot ? radius - 8 : 0}
                        />
                      </>
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
            {[...beds].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'sv')).map((bed) => {
              const isPot = bed.type === 'pot';
              const isDesignShape = bed.type === 'shape';
              const icon = isPot ? '🪴' : isDesignShape ? '⬛' : '▭';
              const sizeText = isPot
                ? `Radie: ${bed.radius || 50}px`
                : `${bed.width}×${bed.height}px`;
              const sizeMeters = isPot
                ? formatMeters(pixelsToMeters((bed.radius || 50) * 2))
                : `${formatMeters(pixelsToMeters(bed.width))} × ${formatMeters(pixelsToMeters(bed.height))}`;
              const fillColor = bed.color || getDefaultColor(bed.type);
              const borderColor = bed.strokeColor || getDefaultStrokeColor(bed.type);

              return (
                <div
                  key={bed.id}
                  onClick={() => selectBed(bed.id)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selected === bed.id
                      ? 'border-plant-500 bg-plant-50'
                      : 'border-earth-200 hover:border-plant-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <div className="font-semibold text-earth-800">{bed.name}</div>
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: fillColor, borderColor }}
                    />
                  </div>
                  <div className="text-xs text-earth-600 mt-1">
                    Position: ({Math.round(bed.x)}, {Math.round(bed.y)}) • {sizeText}
                  </div>
                  <div className="text-xs text-earth-500 mt-0.5">
                    Storlek: {sizeMeters}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plantering per odlingsplats */}
      {selectedPlan && yearPlans[selectedPlan] && savedBeds.length > 0 && (() => {
        const plan = yearPlans[selectedPlan];
        const planBedIds = Object.keys(plan.bedPlants || {});
        const bedsWithPlants = savedBeds.filter(b => 
          planBedIds.includes(String(b.id)) || planBedIds.includes(b.id)
        );
        
        if (bedsWithPlants.length === 0) return null;
        
        return (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-earth-800 mb-3">
              🌱 Plantering per odlingsplats – {selectedPlan}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {bedsWithPlants.map(bed => (
                      <th 
                        key={bed.id}
                        className="bg-plant-100 text-plant-800 px-4 py-3 text-left font-semibold border-b-2 border-plant-300 whitespace-nowrap"
                      >
                        {bed.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const columns = bedsWithPlants.map(bed => getBedPlantNames(plan, bed.id));
                    const maxRows = columns.reduce((max, col) => Math.max(max, col.length), 0);
                    
                    return Array.from({ length: maxRows }).map((_, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-earth-50'}>
                        {columns.map((col, colIdx) => (
                          <td 
                            key={colIdx}
                            className="px-4 py-2 border-b border-earth-200 text-earth-700"
                          >
                            {col[rowIdx] || ''}
                          </td>
                        ))}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

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
