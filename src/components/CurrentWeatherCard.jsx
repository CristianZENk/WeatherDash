import { Droplets, MapPin, Wind } from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, formatWindSpeed } from '../services/weatherApi';

export function CurrentWeatherCard({ weather, unit }) {
  const { location, current, meta } = weather;
  const observedTime = new Date(current.observedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section
      aria-label="Current weather"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            <span>
              {location.name}
              {location.country ? `, ${location.country}` : ''}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900">
              {formatTemperature(current.tempC, unit)}
            </span>
            <span className="text-base font-medium text-slate-600">{current.condition.label}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Updated {observedTime} · {meta.source}
            {meta.fromCache ? ' (cached)' : ''}
          </p>
        </div>

        <div className="flex items-center sm:justify-end">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <WeatherIcon type={current.condition.icon} className="w-12 h-12" />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3">
          <Droplets className="w-5 h-5 text-sky-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500">Humidity</p>
            <p className="text-sm font-semibold text-slate-900">{current.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 px-4 py-3">
          <Wind className="w-5 h-5 text-slate-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-500">Wind Speed</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatWindSpeed(current.windMs, unit)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
