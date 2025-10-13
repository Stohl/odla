# 🌱 Knopp

Din digitala odlingsassistent - En komplett React-app för att planera din odlingssäsong.

**Live demo:** https://stohl.github.io/odla/

## ✨ Funktioner

### 🌱 Fröbank
- Utforska tusentals växter och frön
- Sök och filtrera efter namn, kategori, pris
- Minimal kalendervy direkt i listan
- Bygg din egen önskelista
- Detaljerad information med bilder

### 📅 Odlingskalender
- Gantt-liknande kalendervy med färgkodade månader
- Se när du ska så, förkultivera och skörda
- Markerad nuvarande månad
- Hover-tooltips med detaljerad information

### 🌿 Odlingsbäddar
- Skapa och hantera dina odlingsbäddar
- Ange mått (bredd × längd), beskrivning och växter
- Export/import som JSON
- Spara oberoende av visuella designer

### 🪴 Trädgårdsdesigner
- Visuell planering med A4-format canvas
- Drag-and-drop odlingsbäddar
- Flera sparade designer ("2025", "2026", "Förslag 1", osv)
- Exportera som PNG-bild
- Zooma och panorera för detaljerad planering

**Tekniska funktioner:**
- 💾 Allt sparas lokalt i localStorage - ingen backend krävs
- 📱 Fullt responsiv design för mobil och desktop
- 🎨 Vacker UI med naturliga färger (Tailwind CSS)
- ⚡ Snabb och smooth med React + Vite

## 🚀 Kom igång

### Installation

```bash
npm install
```

### Utveckling

```bash
npm run dev
```

Öppna [http://localhost:5173](http://localhost:5173) i din webbläsare.

### Bygga för produktion

```bash
npm run build
```

### Deploya till GitHub Pages

```bash
npm run deploy
```

## 🎨 Färgkodning i kalender

- 🟦 **Blått** - Förkultiveras inomhus
- 🟩 **Grönt** - Direktsås ute
- 🟨 **Gult** - Skördas/blommar

## 📁 Projektstruktur

```
src/
  components/
    SeedBank.jsx         # Fröbank med sök och filter
    CalendarView.jsx     # Huvudkalender med Gantt-vy
    PlantRow.jsx        # Rad per växt med månadsband
    FilterBar.jsx       # Sök- och filterfält
    MyPlantsPanel.jsx   # Detaljvy för valda växter
    BedManager.jsx      # Hantera odlingsbäddar
    GardenPlanner.jsx   # Huvudvy för trädgårdsdesigner
    GardenDesigner.jsx  # Canvas för visuell planering
    DesignManager.jsx   # Hantera flera designer
    Header.jsx          # Rubrik och branding
  App.jsx              # Huvudkomponent med navigation
  main.jsx            # Entry point
  index.css           # Tailwind & global CSS
public/
  fron_data.json  # Växtdata med tusentals frön
```

## 🌿 Dataformat

Varje växt i `fron_data.json` har följande struktur:

```json
{
  "name": "Tomat 'Blackball'",
  "latin_name": "Solanum lycopersicum",
  "description": "Beskrivning...",
  "category": "Grönsak",
  "sowing_months": [2, 3, 4],
  "direct_sow_months": [],
  "harvest_months": [7, 8, 9, 10],
  "bloom_months": [7, 8, 9, 10],
  "price": "53.50 kr",
  "position": "sol",
  "product_url": "https://..."
}
```

## 🛠️ Teknologi

- **React 18** - UI-ramverk
- **Vite** - Snabb utvecklingsserver och build
- **Tailwind CSS** - Utility-first CSS
- **React Konva** - Canvas-rendering för trädgårdsdesigner
- **LocalStorage** - Spara användardata

## 📝 Licens

MIT

---

Byggt med ❤️ för svenska odlare 🌱
