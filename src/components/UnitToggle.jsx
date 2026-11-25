export default function UnitToggle({ unit, onToggle, disabled }) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
      role="group"
      aria-label="Temperature unit"
    >
      <button
        type="button"
        onClick={() => unit !== 'metric' && onToggle('metric')}
        disabled={disabled}
        aria-pressed={unit === 'metric'}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
          unit === 'metric'
            ? 'bg-sky-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        °C
      </button>
      <button
        type="button"
        onClick={() => unit !== 'imperial' && onToggle('imperial')}
        disabled={disabled}
        aria-pressed={unit === 'imperial'}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
          unit === 'imperial'
            ? 'bg-sky-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        °F
      </button>
    </div>
  );
}
