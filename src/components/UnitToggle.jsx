export function UnitToggle({ unit, onChange }) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
      role="group"
      aria-label="Temperature unit"
    >
      <button
        type="button"
        onClick={() => onChange('metric')}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
          unit === 'metric'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        °C
      </button>
      <button
        type="button"
        onClick={() => onChange('imperial')}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
          unit === 'imperial'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        °F
      </button>
    </div>
  );
}
