import { WeatherIcon } from './WeatherIcon';
import { formatTemperature } from '../services/weatherApi';

export function ForecastList({ forecast, unit }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <section aria-label="3-day forecast" className="mt-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          3-Day Forecast
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forecast.map((day) => (
          <article
            key={day.date}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex sm:flex-col items-center justify-between sm:items-start gap-3"
          >
            <div className="flex sm:w-full items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{day.dayLabel}</p>
                <p className="text-xs text-slate-400">{day.dateLabel}</p>
              </div>
              <WeatherIcon type={day.condition.icon} className="w-8 h-8" />
            </div>
            <div className="sm:w-full sm:pt-2 sm:border-t sm:border-slate-100 flex sm:justify-between items-center gap-3 text-right sm:text-left">
              <span className="hidden sm:inline text-xs text-slate-500">{day.condition.label}</span>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-slate-900">
                  {formatTemperature(day.maxC, unit)}
                </span>
                <span className="text-slate-400">{formatTemperature(day.minC, unit)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
