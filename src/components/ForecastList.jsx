import WeatherIcon from './WeatherIcon';

export default function ForecastList({ forecast, unit }) {
  if (!forecast || forecast.length === 0) return null;

  const tempSymbol = unit === 'imperial' ? '°F' : '°C';

  return (
    <section aria-label="3-day forecast">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        3-Day Forecast
      </h3>

      <div className="flex flex-col gap-3 md:grid md:grid-cols-3">
        {forecast.map((day) => (
          <article
            key={day.dateKey}
            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs md:flex-col md:items-start md:gap-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{day.dayLabel}</p>
              <p className="text-xs capitalize text-slate-500">{day.description}</p>
            </div>

            <div className="flex items-center gap-4 md:w-full md:justify-between">
              <WeatherIcon iconCode={day.iconCode} className="h-11 w-11" />
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {day.tempMax}
                  {tempSymbol}
                </p>
                <p className="text-xs text-slate-500">
                  Low {day.tempMin}
                  {tempSymbol}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
