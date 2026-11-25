const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const DEFAULT_API_KEY_PLACEHOLDER = 'your_openweather_api_key_here';

export function hasValidApiKey() {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  return Boolean(key && key.trim() && key.trim() !== DEFAULT_API_KEY_PLACEHOLDER);
}

function getApiKey() {
  return import.meta.env.VITE_OPENWEATHER_API_KEY?.trim() || '';
}

function mapHttpError(status) {
  if (status === 404) {
    return new Error('City not found. Please check spelling or try a ZIP code.');
  }
  if (status === 401) {
    return new Error('Invalid API key. Please check VITE_OPENWEATHER_API_KEY in .env.');
  }
  if (status === 429) {
    return new Error('API rate limit reached. Please wait a moment and try again.');
  }
  if (status >= 500) {
    return new Error('Weather service is temporarily unavailable. Please try again later.');
  }
  return new Error(`Unexpected weather service error (HTTP ${status}).`);
}

function normalizeCurrentWeather(raw) {
  const weather = raw.weather?.[0] || {};
  return {
    city: raw.name,
    country: raw.sys?.country || '',
    temp: Math.round(raw.main?.temp ?? 0),
    feelsLike: Math.round(raw.main?.feels_like ?? raw.main?.temp ?? 0),
    humidity: raw.main?.humidity ?? 0,
    windSpeed: Number((raw.wind?.speed ?? 0).toFixed(1)),
    condition: weather.main || 'Clear',
    description: weather.description || 'clear sky',
    iconCode: weather.icon || '01d',
    updatedAt: raw.dt ? new Date(raw.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    isDemo: false,
  };
}

/**
 * Aggregates 3-hour interval forecast entries into the next 3 distinct calendar days.
 */
function normalizeForecast(raw) {
  const list = raw.list || [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const daysMap = new Map();

  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().slice(0, 10);
    if (dateKey === todayKey) continue;

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, {
        dateKey,
        date,
        temps: [],
        entries: [],
      });
    }

    const bucket = daysMap.get(dateKey);
    bucket.temps.push(item.main.temp_min, item.main.temp_max);
    bucket.entries.push(item);
  }

  const nextThreeDays = Array.from(daysMap.values()).slice(0, 3);

  return nextThreeDays.map((bucket) => {
    const middayEntry =
      bucket.entries.find((entry) => entry.dt_txt?.includes('12:00:00')) ||
      bucket.entries[Math.floor(bucket.entries.length / 2)] ||
      bucket.entries[0];

    const weather = middayEntry?.weather?.[0] || {};

    return {
      dateKey: bucket.dateKey,
      dayLabel: bucket.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      tempMin: Math.round(Math.min(...bucket.temps)),
      tempMax: Math.round(Math.max(...bucket.temps)),
      condition: weather.main || 'Clear',
      description: weather.description || 'clear sky',
      iconCode: weather.icon || '01d',
    };
  });
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network error. Please check your internet connection and try again.');
  }

  if (!response.ok) {
    throw mapHttpError(response.status);
  }

  return response.json();
}

// --- Deterministic Demo Mode Fallback (when no API key is configured) ---

const DEMO_CONDITIONS = [
  { condition: 'Clear', description: 'clear sky', iconCode: '01d', baseC: 23, humidity: 45, windMs: 3.4 },
  { condition: 'Clouds', description: 'scattered clouds', iconCode: '03d', baseC: 17, humidity: 62, windMs: 4.8 },
  { condition: 'Rain', description: 'light rain', iconCode: '10d', baseC: 13, humidity: 81, windMs: 6.2 },
  { condition: 'Clouds', description: 'partly cloudy', iconCode: '02d', baseC: 20, humidity: 54, windMs: 4.1 },
  { condition: 'Thunderstorm', description: 'scattered thunderstorms', iconCode: '11d', baseC: 19, humidity: 78, windMs: 7.5 },
];

const INVALID_DEMO_QUERIES = new Set(['invalid', 'invalidcity', 'nonexistent', '00000', 'asdf', 'error']);

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function toDisplayTemp(tempC, unit) {
  return unit === 'imperial' ? Math.round((tempC * 9) / 5 + 32) : Math.round(tempC);
}

function toDisplayWind(windMs, unit) {
  const value = unit === 'imperial' ? windMs * 2.23694 : windMs;
  return Number(value.toFixed(1));
}

function buildDemoWeather(queryLabel, unit) {
  const clean = queryLabel.trim();
  if (INVALID_DEMO_QUERIES.has(clean.toLowerCase())) {
    throw mapHttpError(404);
  }

  const seed = hashString(clean.toLowerCase());
  const baseProfile = DEMO_CONDITIONS[seed % DEMO_CONDITIONS.length];
  const tempOffset = (seed % 7) - 3;
  const currentC = baseProfile.baseC + tempOffset;

  const formattedCity = /^\d+$/.test(clean)
    ? `ZIP ${clean}`
    : clean
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

  const current = {
    city: formattedCity,
    country: 'DEMO',
    temp: toDisplayTemp(currentC, unit),
    feelsLike: toDisplayTemp(currentC - 1, unit),
    humidity: Math.min(95, Math.max(25, baseProfile.humidity + ((seed % 11) - 5))),
    windSpeed: toDisplayWind(baseProfile.windMs, unit),
    condition: baseProfile.condition,
    description: baseProfile.description,
    iconCode: baseProfile.iconCode,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDemo: true,
  };

  const forecast = [1, 2, 3].map((dayOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const profile = DEMO_CONDITIONS[(seed + dayOffset) % DEMO_CONDITIONS.length];
    const minC = profile.baseC - 4 + ((seed + dayOffset) % 3);
    const maxC = profile.baseC + 3 + ((seed + dayOffset) % 4);

    return {
      dateKey: date.toISOString().slice(0, 10),
      dayLabel: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      tempMin: toDisplayTemp(minC, unit),
      tempMax: toDisplayTemp(maxC, unit),
      condition: profile.condition,
      description: profile.description,
      iconCode: profile.iconCode,
    };
  });

  return { current, forecast };
}

export async function fetchWeatherByCity(query, unit = 'metric') {
  const trimmed = query?.trim();
  if (!trimmed) {
    throw new Error('Please enter a city name or ZIP code.');
  }

  if (!hasValidApiKey()) {
    return buildDemoWeather(trimmed, unit);
  }

  const apiKey = getApiKey();
  const encodedQuery = encodeURIComponent(trimmed);
  const currentUrl = `${BASE_URL}/weather?q=${encodedQuery}&units=${unit}&appid=${apiKey}`;
  const forecastUrl = `${BASE_URL}/forecast?q=${encodedQuery}&units=${unit}&appid=${apiKey}`;

  const [currentRaw, forecastRaw] = await Promise.all([
    fetchJson(currentUrl),
    fetchJson(forecastUrl),
  ]);

  return {
    current: normalizeCurrentWeather(currentRaw),
    forecast: normalizeForecast(forecastRaw),
  };
}

export async function fetchWeatherByCoords(lat, lon, unit = 'metric') {
  if (!hasValidApiKey()) {
    return buildDemoWeather('Local Area', unit);
  }

  const apiKey = getApiKey();
  const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
  const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;

  const [currentRaw, forecastRaw] = await Promise.all([
    fetchJson(currentUrl),
    fetchJson(forecastUrl),
  ]);

  return {
    current: normalizeCurrentWeather(currentRaw),
    forecast: normalizeForecast(forecastRaw),
  };
}
