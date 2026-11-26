const STORMGLASS_ENDPOINT = 'https://api.stormglass.io/v2/weather/point';
const OPEN_METEO_GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';
const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';

const CACHE_KEY = 'weatherdash_cache_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes to protect Stormglass daily quota
const REQUEST_TIMEOUT_MS = 10000;

export class WeatherApiError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function pickSourceValue(metricObj, fallback = 0) {
  if (!metricObj || typeof metricObj !== 'object') return fallback;
  const preferred = ['sg', 'noaa', 'ecmwf', 'meteo'];
  for (const key of preferred) {
    if (typeof metricObj[key] === 'number' && !Number.isNaN(metricObj[key])) {
      return metricObj[key];
    }
  }
  const firstNumeric = Object.values(metricObj).find(
    (v) => typeof v === 'number' && !Number.isNaN(v)
  );
  return firstNumeric !== undefined ? firstNumeric : fallback;
}

export function classifyCondition({ cloudCover = 0, precipitation = 0, tempC = 15 }) {
  if (precipitation >= 0.4) {
    if (tempC <= 1) {
      return { icon: 'snow', label: 'Snow' };
    }
    if (precipitation >= 3.0) {
      return { icon: 'rain-heavy', label: 'Heavy Rain' };
    }
    return { icon: 'rain', label: 'Rain' };
  }
  if (cloudCover >= 75) {
    return { icon: 'cloudy', label: 'Overcast' };
  }
  if (cloudCover >= 30) {
    return { icon: 'partly-cloudy', label: 'Partly Cloudy' };
  }
  return { icon: 'sunny', label: 'Clear Sky' };
}

function readCache(cacheId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const entry = cache[cacheId];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(cacheId, data) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[cacheId] = { timestamp: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors
  }
}

export async function geocodeLocation(query) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    throw new WeatherApiError('Please enter at least 2 characters for a city or ZIP code.', 'INVALID_INPUT');
  }

  // Try Open-Meteo Geocoding first (fast, reliable for city names)
  try {
    const omRes = await fetchWithTimeout(
      `${OPEN_METEO_GEOCODE}?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`
    );
    if (omRes.ok) {
      const omData = await omRes.json();
      if (omData.results && omData.results.length > 0) {
        const top = omData.results[0];
        return {
          name: top.name,
          country: top.country_code || top.country || '',
          lat: top.latitude,
          lng: top.longitude,
        };
      }
    }
  } catch {
    // Fall through to Nominatim
  }

  // Fallback to Nominatim (handles postal/ZIP codes and global queries)
  try {
    const nomRes = await fetchWithTimeout(
      `${NOMINATIM_SEARCH}?q=${encodeURIComponent(trimmed)}&format=json&limit=1&addressdetails=1`
    );
    if (!nomRes.ok) {
      throw new WeatherApiError('Location lookup service is temporarily unavailable.', 'NETWORK');
    }
    const nomData = await nomRes.json();
    if (!Array.isArray(nomData) || nomData.length === 0) {
      throw new WeatherApiError(
        `No results found for "${trimmed}". Please verify the city name or ZIP code.`,
        'NOT_FOUND'
      );
    }
    const place = nomData[0];
    const addr = place.address || {};
    const name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      place.display_name.split(',')[0];
    return {
      name,
      country: (addr.country_code || '').toUpperCase(),
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    };
  } catch (err) {
    if (err instanceof WeatherApiError) throw err;
    if (err.name === 'AbortError') {
      throw new WeatherApiError('Location search timed out. Please try again.', 'TIMEOUT');
    }
    throw new WeatherApiError('Network error while searching for location.', 'NETWORK');
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetchWithTimeout(
      `${NOMINATIM_REVERSE}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json`
    );
    if (!res.ok) return { name: 'Current Location', country: '' };
    const data = await res.json();
    const addr = data.address || {};
    const name =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      'Current Location';
    return {
      name,
      country: (addr.country_code || '').toUpperCase(),
    };
  } catch {
    return { name: 'Current Location', country: '' };
  }
}

function normalizeStormglassPayload(payload, locationInfo) {
  const parseStart = performance.now();
  const hours = payload?.hours;
  if (!Array.isArray(hours) || hours.length === 0) {
    throw new WeatherApiError('Weather provider returned empty data.', 'EMPTY_DATA');
  }

  const nowMs = Date.now();
  let currentHour = hours[0];
  let bestDiff = Math.abs(new Date(hours[0].time).getTime() - nowMs);
  for (const h of hours) {
    const diff = Math.abs(new Date(h.time).getTime() - nowMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      currentHour = h;
    }
  }

  const currentTemp = pickSourceValue(currentHour.airTemperature, 0);
  const currentHumidity = Math.round(pickSourceValue(currentHour.humidity, 0));
  const currentWindMs = pickSourceValue(currentHour.windSpeed, 0);
  const currentCloud = pickSourceValue(currentHour.cloudCover, 0);
  const currentPrecip = pickSourceValue(currentHour.precipitation, 0);
  const currentCondition = classifyCondition({
    cloudCover: currentCloud,
    precipitation: currentPrecip,
    tempC: currentTemp,
  });

  // Group hourly points by local date YYYY-MM-DD
  const byDate = new Map();
  for (const h of hours) {
    const d = new Date(h.time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(h);
  }

  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  })();

  const upcomingKeys = Array.from(byDate.keys())
    .filter((k) => k > todayKey)
    .slice(0, 3);

  const forecast = upcomingKeys.map((dateKey) => {
    const entries = byDate.get(dateKey);
    const temps = entries.map((e) => pickSourceValue(e.airTemperature, 0));
    const clouds = entries.map((e) => pickSourceValue(e.cloudCover, 0));
    const precips = entries.map((e) => pickSourceValue(e.precipitation, 0));

    const minC = Math.min(...temps);
    const maxC = Math.max(...temps);
    const avgCloud = clouds.reduce((a, b) => a + b, 0) / clouds.length;
    const maxPrecip = Math.max(...precips);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    const condition = classifyCondition({
      cloudCover: avgCloud,
      precipitation: maxPrecip,
      tempC: avgTemp,
    });

    const dateObj = new Date(`${dateKey}T12:00:00`);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: dateKey,
      dayLabel,
      dateLabel,
      minC,
      maxC,
      condition,
    };
  });

  const parseMs = Math.max(1, Math.round(performance.now() - parseStart));

  return {
    location: locationInfo,
    current: {
      tempC: currentTemp,
      humidity: currentHumidity,
      windMs: currentWindMs,
      cloudCover: Math.round(currentCloud),
      condition: currentCondition,
      observedAt: currentHour.time,
    },
    forecast,
    meta: {
      source: 'Stormglass v2',
      parseMs,
      quotaRemaining:
        typeof payload?.meta?.dailyQuota === 'number' && typeof payload?.meta?.requestCount === 'number'
          ? Math.max(0, payload.meta.dailyQuota - payload.meta.requestCount)
          : null,
      fromCache: false,
    },
  };
}

export async function fetchWeatherByCoords(lat, lng, locationInfo, { forceRefresh = false } = {}) {
  const apiKey = import.meta.env.VITE_STORMGLASS_API_KEY;
  if (!apiKey || apiKey === 'your_stormglass_api_key_here') {
    throw new WeatherApiError(
      'Stormglass API key is missing. Add VITE_STORMGLASS_API_KEY to your .env file or switch to Demo Mode.',
      'MISSING_KEY'
    );
  }

  const cacheId = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (!forceRefresh) {
    const cached = readCache(cacheId);
    if (cached) {
      return {
        ...cached,
        location: locationInfo,
        meta: { ...cached.meta, fromCache: true },
      };
    }
  }

  const start = new Date();
  start.setUTCMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 96 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    lat: lat.toFixed(4),
    lng: lng.toFixed(4),
    params: 'airTemperature,humidity,windSpeed,cloudCover,precipitation',
    start: start.toISOString(),
    end: end.toISOString(),
  });

  let response;
  try {
    response = await fetchWithTimeout(`${STORMGLASS_ENDPOINT}?${params.toString()}`, {
      headers: {
        Authorization: apiKey,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new WeatherApiError('Weather API request timed out. Please try again.', 'TIMEOUT');
    }
    throw new WeatherApiError(
      'Unable to connect to Stormglass API. Please check your network connection.',
      'NETWORK'
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new WeatherApiError('Invalid Stormglass API key. Please check your .env file.', 'AUTH');
    }
    if (response.status === 402 || response.status === 429) {
      throw new WeatherApiError(
        'Stormglass daily API quota or rate limit reached. You can use Demo Mode below to continue previewing.',
        'RATE_LIMIT'
      );
    }
    throw new WeatherApiError(`Weather API returned status ${response.status}.`, 'API_ERROR');
  }

  const payload = await response.json();
  const normalized = normalizeStormglassPayload(payload, locationInfo);
  writeCache(cacheId, normalized);
  return normalized;
}

export function getDemoWeather(cityLabel = 'Bucharest') {
  const presets = {
    bucharest: {
      location: { name: 'Bucharest', country: 'RO', lat: 44.4268, lng: 26.1025 },
      tempC: 11.4,
      humidity: 58,
      windMs: 3.8,
      cloudCover: 35,
      condition: { icon: 'partly-cloudy', label: 'Partly Cloudy' },
      forecast: [
        { minC: 5.2, maxC: 13.8, condition: { icon: 'sunny', label: 'Clear Sky' } },
        { minC: 6.1, maxC: 12.4, condition: { icon: 'partly-cloudy', label: 'Partly Cloudy' } },
        { minC: 4.5, maxC: 9.7, condition: { icon: 'rain', label: 'Rain' } },
      ],
    },
    london: {
      location: { name: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
      tempC: 9.6,
      humidity: 76,
      windMs: 5.4,
      cloudCover: 82,
      condition: { icon: 'cloudy', label: 'Overcast' },
      forecast: [
        { minC: 6.0, maxC: 11.2, condition: { icon: 'rain', label: 'Rain' } },
        { minC: 5.5, maxC: 12.0, condition: { icon: 'partly-cloudy', label: 'Partly Cloudy' } },
        { minC: 7.2, maxC: 13.1, condition: { icon: 'sunny', label: 'Clear Sky' } },
      ],
    },
  };

  const key = cityLabel.toLowerCase().includes('london') ? 'london' : 'bucharest';
  const chosen = presets[key];
  const baseDate = new Date();

  const forecast = chosen.forecast.map((item, idx) => {
    const d = new Date(baseDate.getTime() + (idx + 1) * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...item,
    };
  });

  return {
    location: chosen.location,
    current: {
      tempC: chosen.tempC,
      humidity: chosen.humidity,
      windMs: chosen.windMs,
      cloudCover: chosen.cloudCover,
      condition: chosen.condition,
      observedAt: new Date().toISOString(),
    },
    forecast,
    meta: {
      source: 'Demo Dataset',
      parseMs: 1,
      quotaRemaining: null,
      fromCache: false,
    },
  };
}

export function formatTemperature(tempC, unit) {
  if (unit === 'imperial') {
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export function formatWindSpeed(windMs, unit) {
  if (unit === 'imperial') {
    return `${(windMs * 2.23694).toFixed(1)} mph`;
  }
  return `${(windMs * 3.6).toFixed(1)} km/h`;
}
