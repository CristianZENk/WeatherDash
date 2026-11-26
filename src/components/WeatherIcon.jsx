import { Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';

export function WeatherIcon({ type, className = 'w-10 h-10' }) {
  switch (type) {
    case 'sunny':
      return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
    case 'partly-cloudy':
      return <CloudSun className={`${className} text-sky-500`} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-400`} aria-hidden="true" />;
    case 'rain':
      return <CloudDrizzle className={`${className} text-sky-600`} aria-hidden="true" />;
    case 'rain-heavy':
      return <CloudRain className={`${className} text-blue-600`} aria-hidden="true" />;
    case 'snow':
      return <CloudSnow className={`${className} text-cyan-500`} aria-hidden="true" />;
    default:
      return <CloudSun className={`${className} text-sky-500`} aria-hidden="true" />;
  }
}
