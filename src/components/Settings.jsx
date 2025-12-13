import React, { useEffect, useState } from 'react';

const STORAGE_KEYS = [
  { key: 'myPlants', label: 'Mina växter (myPlants)' },
  { key: 'yearPlans', label: 'Årsplaner (yearPlans)' },
  { key: 'myGardenBeds', label: 'Odlingsplatser (myGardenBeds)' },
];

const safePretty = (raw) => {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

const Settings = ({ theme, onThemeChange }) => {
  const [entries, setEntries] = useState({});
  const [allBundle, setAllBundle] = useState('{}');

  const loadEntries = () => {
    const next = {};
    STORAGE_KEYS.forEach(({ key }) => {
      const raw = localStorage.getItem(key);
      next[key] = raw === null || raw === undefined ? '' : safePretty(raw);
    });

    const bundle = STORAGE_KEYS.reduce((acc, { key }) => {
      const raw = localStorage.getItem(key);
      if (raw !== null && raw !== undefined) {
        try {
          acc[key] = JSON.parse(raw);
        } catch {
          acc[key] = raw;
        }
      }
      return acc;
    }, {});

    setEntries(next);
    setAllBundle(JSON.stringify(bundle, null, 2));
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const saveEntry = (key) => {
    const value = entries[key] ?? '';
    
    // Kolla om texten är giltig JSON
    let isValidJson = false;
    try {
      JSON.parse(value);
      isValidJson = true;
    } catch {
      isValidJson = false;
    }
    
    // Bygg varningsmeddelande
    let message = 'OBS Tidigare sparad data kommer raderas!\n\n';
    if (!isValidJson && value.trim() !== '') {
      message += 'OBS Texten du försöker spara verkar inte vara korrekt format!\n\n';
    }
    message += 'Vill du fortsätta?';
    
    if (!confirm(message)) {
      return; // Avbryt
    }
    
    // Spara data
    if (isValidJson) {
      const parsed = JSON.parse(value);
      localStorage.setItem(key, JSON.stringify(parsed));
    } else {
      localStorage.setItem(key, value);
    }
    
    // Ladda om sidan
    window.location.reload();
  };

  const saveAll = () => {
    // Kolla om texten är giltig JSON
    let isValidJson = false;
    try {
      JSON.parse(allBundle);
      isValidJson = true;
    } catch {
      isValidJson = false;
    }
    
    // Bygg varningsmeddelande
    let message = 'OBS Tidigare sparad data kommer raderas!\n\n';
    if (!isValidJson && allBundle.trim() !== '{}' && allBundle.trim() !== '') {
      message += 'OBS Texten du försöker spara verkar inte vara korrekt format!\n\n';
    }
    message += 'Vill du fortsätta?';
    
    if (!confirm(message)) {
      return; // Avbryt
    }
    
    // Spara data
    if (isValidJson) {
      const parsed = JSON.parse(allBundle);
      Object.entries(parsed).forEach(([key, val]) => {
        localStorage.setItem(key, JSON.stringify(val));
      });
    } else {
      alert('Kunde inte tolka ALLA-texten som JSON. Kontrollera formatet.');
      return;
    }
    
    // Ladda om sidan
    window.location.reload();
  };

  const handleChange = (key, value) => {
    setEntries((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
      <div className="bg-white rounded-xl shadow-md border border-earth-200 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-earth-900 mb-1">Inställningar</h1>
          <p className="text-sm text-earth-600">
            Växla tema och hantera sparad data. Du kan kopiera texten och dela (t.ex. forum) eller klistra in och spara.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50">
            <h2 className="font-semibold text-earth-800 mb-2">Tema</h2>
            <p className="text-sm text-earth-600 mb-3">
              Växla mellan ljust och mörkt läge.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-plant-500 text-white shadow-md'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                Ljust
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-plant-500 text-white shadow-md'
                    : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
                }`}
              >
                Mörkt
              </button>
            </div>
          </section>

          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50 sm:col-span-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-semibold text-earth-800">LocalStorage – export/import</h2>
              <button
                type="button"
                onClick={loadEntries}
                className="px-3 py-1.5 rounded-md text-sm font-semibold bg-earth-200 text-earth-800 hover:bg-earth-300 transition-colors"
              >
                Ladda om
              </button>
            </div>
            <p className="text-sm text-earth-600 mb-3">
              Kopiera texten och dela. Klistra in mottagen text och spara för att skriva till localStorage.
            </p>

            <div className="space-y-4">
              {STORAGE_KEYS.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-earth-800 text-sm">{label}</span>
                    <button
                      type="button"
                      onClick={() => saveEntry(key)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-plant-500 text-white hover:bg-plant-600 transition-colors"
                    >
                      Spara
                    </button>
                  </div>
                  <textarea
                    value={entries[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full min-h-[140px] px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 text-sm font-mono bg-white"
                    spellCheck="false"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-earth-800 text-sm">Alla (bundle JSON)</span>
                  <button
                    type="button"
                    onClick={saveAll}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-plant-500 text-white hover:bg-plant-600 transition-colors"
                  >
                    Spara alla
                  </button>
                </div>
                <textarea
                  value={allBundle}
                  onChange={(e) => setAllBundle(e.target.value)}
                  className="w-full min-h-[160px] px-3 py-2 border-2 border-earth-200 rounded-lg focus:outline-none focus:border-plant-400 text-sm font-mono bg-white"
                  spellCheck="false"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;

