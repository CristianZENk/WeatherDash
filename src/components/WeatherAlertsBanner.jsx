import { CloudRain, CloudSnow, Snowflake, Sun } from 'lucide-react';
import { formatTemperature } from '../services/weatherApi';

const ALERT_STYLES = {
  warm: {
    container: 'border-amber-200 bg-amber-50/90',
    iconWrap: 'bg-amber-100 text-amber-600',
    title: 'text-amber-950',
    body: 'text-amber-800',
    Icon: Sun,
  },
  cold: {
    container: 'border-blue-200 bg-blue-50/90',
    iconWrap: 'bg-blue-100 text-blue-600',
    title: 'text-blue-950',
    body: 'text-blue-800',
    Icon: Snowflake,
  },
  rain: {
    container: 'border-sky-200 bg-sky-50/90',
    iconWrap: 'bg-sky-100 text-sky-600',
    title: 'text-sky-950',
    body: 'text-sky-800',
    Icon: CloudRain,
  },
  snow: {
    container: 'border-cyan-200 bg-cyan-50/90',
    iconWrap: 'bg-cyan-100 text-cyan-600',
    title: 'text-cyan-950',
    body: 'text-cyan-800',
    Icon: CloudSnow,
  },
};

function getAlertHeading(alert, unit) {
  switch (alert.type) {
    case 'warm':
      return `Warm weather alert (≥ ${formatTemperature(alert.thresholdC, unit)})`;
    case 'cold':
      return `Cold weather alert (≤ ${formatTemperature(alert.thresholdC, unit)})`;
    case 'rain':
      return 'Rain expected in upcoming days';
    case 'snow':
      return 'Snow expected in upcoming days';
    default:
      return 'Weather recommendation';
  }
}

function formatDaysSummary(alert, unit) {
  if (alert.type === 'warm') {
    return alert.days.map((d) => `${d.dayLabel} (${formatTemperature(d.maxC, unit)})`).join(', ');
  }
  if (alert.type === 'cold') {
    return alert.days.map((d) => `${d.dayLabel} (${formatTemperature(d.minC, unit)})`).join(', ');
  }
  return alert.days.map((d) => `${d.dayLabel} (${d.condition.label})`).join(', ');
}

export function WeatherAlertsBanner({ alerts, unit }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="mt-4 space-y-2.5" role="status" aria-label="Personalized weather recommendations">
      {alerts.map((alert) => {
        const style = ALERT_STYLES[alert.type] || ALERT_STYLES.warm;
        const IconComponent = style.Icon;
        return (
          <div
            key={alert.type}
            className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${style.container}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.iconWrap}`}
            >
              <IconComponent className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="text-xs sm:text-sm">
              <p className={`font-semibold ${style.title}`}>{getAlertHeading(alert, unit)}</p>
              <p className={`mt-0.5 ${style.body}`}>
                <span className="font-medium">{formatDaysSummary(alert, unit)}</span> —{' '}
                {alert.recommendation}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
