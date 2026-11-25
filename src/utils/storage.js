const LAST_CITY_KEY = 'weatherdash_last_city';
const UNIT_KEY = 'weatherdash_unit';

export function getSavedCity() {
  try {
    return localStorage.getItem(LAST_CITY_KEY) || null;
  } catch {
    return null;
  }
}

export function saveCity(cityName) {
  try {
    if (cityName) {
      localStorage.setItem(LAST_CITY_KEY, cityName);
    }
  } catch {
    // Ignore storage quota or privacy-mode errors
  }
}

export function getSavedUnit() {
  try {
    const saved = localStorage.getItem(UNIT_KEY);
    return saved === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

export function saveUnit(unit) {
  try {
    if (unit === 'metric' || unit === 'imperial') {
      localStorage.setItem(UNIT_KEY, unit);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Wraps HTML5 Geolocation API in a Promise.
 * Rejects on denial, unavailability, or timeout so callers can fall back gracefully.
 */
export function getCurrentCoordinates(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        reject(new Error(err.message || 'Unable to retrieve location.'));
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 300000,
      }
    );
  });
}
