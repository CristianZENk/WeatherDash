/**
 * Renders a crisp, minimalist SVG weather icon mapped from OpenWeather icon codes.
 */
export default function WeatherIcon({ iconCode = '01d', className = 'w-12 h-12' }) {
  const code = iconCode.slice(0, 2);

  // Clear sky
  if (code === '01') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <circle cx="24" cy="24" r="9" fill="#F59E0B" />
        <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
          <line x1="24" y1="6" x2="24" y2="10" />
          <line x1="24" y1="38" x2="24" y2="42" />
          <line x1="6" y1="24" x2="10" y2="24" />
          <line x1="38" y1="24" x2="42" y2="24" />
          <line x1="11.3" y1="11.3" x2="14.1" y2="14.1" />
          <line x1="33.9" y1="33.9" x2="36.7" y2="36.7" />
          <line x1="36.7" y1="11.3" x2="33.9" y2="14.1" />
          <line x1="14.1" y1="33.9" x2="11.3" y2="36.7" />
        </g>
      </svg>
    );
  }

  // Few clouds
  if (code === '02') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <circle cx="19" cy="18" r="7" fill="#F59E0B" />
        <path
          d="M17 35h17a7 7 0 0 0 1-13.93A10 10 0 0 0 15.8 23.1 6.5 6.5 0 0 0 17 35Z"
          fill="#94A3B8"
        />
      </svg>
    );
  }

  // Scattered / broken clouds
  if (code === '03' || code === '04') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 34h21a7.5 7.5 0 0 0 1.1-14.92A10.5 10.5 0 0 0 15.8 21.3 6.8 6.8 0 0 0 14 34Z"
          fill="#94A3B8"
        />
      </svg>
    );
  }

  // Shower / Rain
  if (code === '09' || code === '10') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 30h21a7 7 0 0 0 1-13.93A10 10 0 0 0 16.5 18.2 6.3 6.3 0 0 0 14 30Z"
          fill="#64748B"
        />
        <g stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="34" x2="16" y2="40" />
          <line x1="25" y1="34" x2="23" y2="40" />
          <line x1="32" y1="34" x2="30" y2="40" />
        </g>
      </svg>
    );
  }

  // Thunderstorm
  if (code === '11') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 29h21a7 7 0 0 0 1-13.93A10 10 0 0 0 16.5 17.2 6.3 6.3 0 0 0 14 29Z"
          fill="#475569"
        />
        <path d="M25 29l-4 7h4l-2 6 7-8h-4l2-5h-3Z" fill="#F59E0B" />
      </svg>
    );
  }

  // Snow
  if (code === '13') {
    return (
      <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
        <path
          d="M14 29h21a7 7 0 0 0 1-13.93A10 10 0 0 0 16.5 17.2 6.3 6.3 0 0 0 14 29Z"
          fill="#94A3B8"
        />
        <g fill="#38BDF8">
          <circle cx="18" cy="36" r="2" />
          <circle cx="25" cy="38" r="2" />
          <circle cx="32" cy="36" r="2" />
        </g>
      </svg>
    );
  }

  // Mist / Fog fallback
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <g stroke="#94A3B8" strokeWidth="2.8" strokeLinecap="round">
        <line x1="10" y1="18" x2="38" y2="18" />
        <line x1="14" y1="25" x2="34" y2="25" />
        <line x1="10" y1="32" x2="38" y2="32" />
      </g>
    </svg>
  );
}
