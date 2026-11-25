import WeatherIcon from './WeatherIcon';

export default function CurrentWeather({ data, unit }) {
  if (!data) return null;

  const tempSymbol = unit === 'imperial' ? '°F' : '°C';
  const windUnit = unit === 'imperial' ? 'mph' : 'm/s';

  return (
    <section
      aria-label="Current weather"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {data.city}
              {data.country && data.country !== 'DEMO' ? `, ${data.country}` : ''}
            </h2>
            {data.isDemo && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                Demo Mode
              </span>
            )}
          </div>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {data.description}
            {data.updatedAt ? ` · Updated ${data.updatedAt}` : ''}
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-slate-900">
              {data.temp}
              {tempSymbol}
            </span>
            <span className="text-sm text-slate-500">
              Feels like {data.feelsLike}
              {tempSymbol}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:flex-col sm:items-end">
          <WeatherIcon iconCode={data.iconCode} className="h-20 w-20" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Condition</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{data.condition}</p>
        </div>

        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Humidity</p>
          <p className="mt-1 text-base font-semibold text-slate-900">{data.humidity}%</p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Wind Speed</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {data.windSpeed} {windUnit}
          </p>
        </div>
      </div>
    </section>
  );
}
