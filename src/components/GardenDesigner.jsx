import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';

const GardenDesigner = ({ beds, setBeds, designName, orientation }) => {
  const [selected, setSelected] = useState(null);
  const [savedBeds, setSavedBeds] = useState([]);
  const [showBedSelector, setShowBedSelector] = useState(false);
  const stageRef = useRef(null);

  // Ladda sparade bäddar från BedManager
  useEffect(() => {
    const saved = localStorage.getItem('myGardenBeds');
    if (saved) {
      try {
        setSavedBeds(JSON.parse(saved));
      } catch (error) {
        console.error('Kunde inte ladda sparade bäddar:', error);
      }
    }
  }, []);

  // Canvas dimensioner baserat på orientering
  const canvasWidth = orientation === 'landscape' ? 1100 : 800;
  const canvasHeight = orientation === 'landscape' ? 800 : 1100;

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

  // Ändra storlek på vald bädd
  const resizeSelected = () => {
    if (!selected) {
      alert('Välj en odlingsplats först');
      return;
    }

    const bed = beds.find((b) => b.id === selected);
    if (!bed) return;

    if (bed.type === 'pot') {
      // För krukor - ändra radie
      const radius = prompt('Radie (px):', bed.radius || 50);
      if (!radius) return;
      const r = parseInt(radius);
      if (isNaN(r) || r <= 0) {
        alert('Ogiltigt värde');
        return;
      }
      setBeds((prev) =>
        prev.map((b) => (b.id === selected ? { ...b, radius: r, width: r*2, height: r*2 } : b))
      );
    } else {
      // För bäddar - ändra bredd och höjd
      const width = prompt('Bredd (px):', bed.width);
      const height = prompt('Höjd (px):', bed.height);

      if (!width || !height) return;

      const w = parseInt(width);
      const h = parseInt(height);

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        alert('Ogiltiga värden');
        return;
      }

      setBeds((prev) =>
        prev.map((b) => (b.id === selected ? { ...b, width: w, height: h } : b))
      );
    }
  };

  // Exportera som PNG
  const exportAsPNG = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `tradgard-${designName}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = uri;
    link.click();
  };

  // Hitta vald bädd
  const selectedBed = beds.find((b) => b.id === selected);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Kontroller */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setShowBedSelector(!showBedSelector)}
          className="px-4 py-2 bg-plant-500 text-white rounded-lg hover:bg-plant-600 transition-colors font-semibold"
        >
          {showBedSelector ? '− Stäng väljare' : '📋 Lägg till från odlingsplatser'}
        </button>

        {selected && (
          <>
            <button
              onClick={editSelected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              ✏️ Ändra namn
            </button>

            <button
              onClick={resizeSelected}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              📏 Ändra storlek
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
          📤 Exportera som PNG
        </button>

        <span className="ml-auto text-earth-600 font-semibold">
          Totalt: {beds.length} platser
        </span>
      </div>

      {/* Info om vald bädd */}
      {selectedBed && (
        <div className="mb-4 p-4 bg-plant-50 border-2 border-plant-300 rounded-lg">
          <h3 className="font-bold text-plant-800 mb-2">Vald bädd: {selectedBed.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-earth-700">
            <div>
              <span className="font-semibold">X:</span> {Math.round(selectedBed.x)} px
            </div>
            <div>
              <span className="font-semibold">Y:</span> {Math.round(selectedBed.y)} px
            </div>
            <div>
              <span className="font-semibold">Bredd:</span> {selectedBed.width} px
            </div>
            <div>
              <span className="font-semibold">Höjd:</span> {selectedBed.height} px
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
        <span className="font-semibold">💡 Tips:</span> Klicka på en bädd för att välja den, dra för att flytta. 
        Dubbelklicka för att redigera namn.
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
                        onDblClick={editSelected}
                        onDblTap={editSelected}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x() - radius, e.target.y() - radius)}
                      />
                    ) : (
                      // Rita bädd som rektangel
                      <Rect
                        x={bed.x}
                        y={bed.y}
                        width={bed.width}
                        height={bed.height}
                        fill="#d8f3dc"
                        stroke={selected === bed.id ? '#1b4332' : '#2d6a4f'}
                        strokeWidth={selected === bed.id ? 4 : 2}
                        draggable
                        shadowBlur={selected === bed.id ? 10 : 5}
                        shadowColor="rgba(0,0,0,0.3)"
                        onClick={() => setSelected(bed.id)}
                        onTap={() => setSelected(bed.id)}
                        onDblClick={editSelected}
                        onDblTap={editSelected}
                        onDragEnd={(e) => handleMove(bed.id, e.target.x(), e.target.y())}
                      />
                    )}
                    
                    <Text
                      x={isPot ? bed.x + radius : bed.x + 8}
                      y={isPot ? bed.y + radius - 8 : bed.y + 8}
                      text={bed.name}
                      fontSize={16}
                      fontStyle="bold"
                      fill={isPot ? '#8b4513' : '#1b4332'}
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
              const icon = isPot ? '🪴' : '▭';
              const sizeText = isPot ? `Radie: ${bed.radius || 50}px` : `${bed.width}×${bed.height}px`;
              
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
