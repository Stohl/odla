import React from 'react';

const Settings = ({ theme, onThemeChange }) => {
  return (
    <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
      <div className="bg-white rounded-xl shadow-md border border-earth-200 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-earth-900 mb-1">Inställningar</h1>
          <p className="text-sm text-earth-600">
            Här kan du samla framtida inställningar. Säg till vad du vill styra så lägger jag till kontroller här.
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

          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50">
            <h2 className="font-semibold text-earth-800 mb-1">Data & källor</h2>
            <p className="text-sm text-earth-600">
              Visa eller hantera källor (Weibulls, Nelson Garden, Wexthuset m.fl.).
            </p>
          </section>

          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50">
            <h2 className="font-semibold text-earth-800 mb-1">Notifieringar</h2>
            <p className="text-sm text-earth-600">
              Här kan du framöver styra påminnelser för sådd, omplantering och skörd.
            </p>
          </section>

          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50">
            <h2 className="font-semibold text-earth-800 mb-1">Export & utskrift</h2>
            <p className="text-sm text-earth-600">
              Planerat utrymme för inställningar för PDF/PNG-export och utskriftsformat.
            </p>
          </section>

          <section className="p-4 rounded-lg border border-earth-200 bg-earth-50">
            <h2 className="font-semibold text-earth-800 mb-1">Teman</h2>
            <p className="text-sm text-earth-600">
              Kommer användas om du vill växla mellan ljus/mörk eller kompakta layouter.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;

