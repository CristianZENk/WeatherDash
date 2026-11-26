import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CloudSun, LogOut, RefreshCw, User } from 'lucide-react';
import {
  fetchWeatherByCoords,
  geocodeLocation,
  getDemoWeather,
  reverseGeocode,
} from './services/weatherApi';
import {
  getCurrentSessionUser,
  getTopRecommendedCities,
  getWarmForecastAlerts,
  loginUser,
  logoutUser,
  recordCitySearch,
  registerUser,
  updateUserPreferences,
} from './services/userStore';
import { SearchBar } from './components/SearchBar';
import { UnitToggle } from './components/UnitToggle';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { ForecastList } from './components/ForecastList';
import { AccountModal } from './components/AccountModal';
import { WarmAlertBanner } from './components/WarmAlertBanner';
import { RecommendationBanner } from './components/RecommendationBanner';

const STORAGE_UNIT_KEY = 'weatherdash_unit';
const STORAGE_LOCATION_KEY = 'weatherdash_last_city';
const DEFAULT_LOCATION = { name: 'Bucharest', country: 'RO', lat: 44.4268, lng: 26.1025 };

function loadSavedUnit(sessionUser) {
  if (sessionUser?.preferredUnit === 'imperial' || sessionUser?.preferredUnit === 'metric') {
    return sessionUser.preferredUnit;
  }
  try {
    const saved = localStorage.getItem(STORAGE_UNIT_KEY);
    return saved === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

function loadSavedLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number' && parsed?.name) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveLocation(loc) {
  try {
    localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(loc));
  } catch {
    // Ignore storage errors
  }
}

export default function App() {
  const [user, setUser] = useState(() => getCurrentSessionUser());
  const [unit, setUnit] = useState(() => loadSavedUnit(getCurrentSessionUser()));
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(() =>
    Boolean(getCurrentSessionUser())
  );

  const loadForCoords = useCallback(async (locationInfo, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherByCoords(
        locationInfo.lat,
        locationInfo.lng,
        locationInfo,
        options
      );
      setWeather(data);
      saveLocation(locationInfo);
    } catch (err) {
      setError({
        message: err.message || 'Failed to load weather data.',
        code: err.code || 'UNKNOWN',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDetectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError({
        message: 'Geolocation is not supported by your browser. Search for a city instead.',
        code: 'GEO_UNSUPPORTED',
      });
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        await loadForCoords({
          name: place.name,
          country: place.country,
          lat: latitude,
          lng: longitude,
        });
      },
      () => {
        const saved = loadSavedLocation() || DEFAULT_LOCATION;
        loadForCoords(saved);
      },
      { timeout: 6000 }
    );
  }, [loadForCoords]);

  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved) {
      loadForCoords(saved);
      return;
    }
    if ('geolocation' in navigator) {
      handleDetectLocation();
    } else {
      loadForCoords(DEFAULT_LOCATION);
    }
  }, [handleDetectLocation, loadForCoords]);

  const handleSearch = async (query) => {
    setLastQuery(query);
    setLoading(true);
    setError(null);
    try {
      const loc = await geocodeLocation(query);
      if (user?.username) {
        const updatedUser = recordCitySearch(user.username, loc);
        if (updatedUser) setUser(updatedUser);
      }
      await loadForCoords(loc);
    } catch (err) {
      setError({
        message: err.message || 'Unable to find that location.',
        code: err.code || 'UNKNOWN',
      });
      setLoading(false);
    }
  };

  const handleUnitChange = (nextUnit) => {
    setUnit(nextUnit);
    try {
      localStorage.setItem(STORAGE_UNIT_KEY, nextUnit);
    } catch {
      // Ignore storage errors
    }
    if (user?.username) {
      const updated = updateUserPreferences(user.username, { preferredUnit: nextUnit });
      if (updated) setUser(updated);
    }
  };

  const handleLogin = (credentials) => {
    const loggedIn = loginUser(credentials);
    setUser(loggedIn);
    if (loggedIn.preferredUnit === 'imperial' || loggedIn.preferredUnit === 'metric') {
      setUnit(loggedIn.preferredUnit);
    }
    setShowRecommendation(true);
  };

  const handleRegister = (payload) => {
    const created = registerUser(payload);
    setUser(created);
    setShowRecommendation(true);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setShowRecommendation(false);
  };

  const handleUpdatePreferences = (updates) => {
    if (!user?.username) return;
    const updated = updateUserPreferences(user.username, updates);
    if (updated) setUser(updated);
  };

  const handleSelectRecommendedCity = (loc) => {
    if (user?.username) {
      const updatedUser = recordCitySearch(user.username, loc);
      if (updatedUser) setUser(updatedUser);
    }
    loadForCoords(loc);
  };

  const handleLoadDemo = () => {
    setError(null);
    setWeather(getDemoWeather(lastQuery || 'Bucharest'));
    setLoading(false);
  };

  const topRecommendedCities = user ? getTopRecommendedCities(user, 3) : [];
  const warmAlertDays = user && weather ? getWarmForecastAlerts(user, weather.forecast) : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                WeatherDash
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Minimalist real-time forecast</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UnitToggle unit={unit} onChange={handleUnitChange} />

            {user ? (
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(true)}
                  title="Account preferences"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                  <span>{user.username}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  aria-label="Log out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAccountModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                Sign in
              </button>
            )}
          </div>
        </header>

        <SearchBar
          onSearch={handleSearch}
          onDetectLocation={handleDetectLocation}
          isLoading={loading}
        />

        {user && showRecommendation && topRecommendedCities.length > 0 && (
          <RecommendationBanner
            username={user.username}
            topCities={topRecommendedCities}
            currentCityName={weather?.location?.name}
            onSelectCity={handleSelectRecommendedCity}
            onDismiss={() => setShowRecommendation(false)}
          />
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
              <span>{error.message}</span>
            </div>
            {(error.code === 'RATE_LIMIT' ||
              error.code === 'MISSING_KEY' ||
              error.code === 'AUTH' ||
              error.code === 'NETWORK') && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                Load Demo Data
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-5 space-y-4 animate-pulse" aria-busy="true" aria-label="Loading weather">
            <div className="h-52 rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="h-12 w-36 bg-slate-200 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 bg-slate-100 rounded-xl" />
                <div className="h-14 bg-slate-100 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-24 bg-white border border-slate-200/80 rounded-2xl" />
              <div className="h-24 bg-white border border-slate-200/80 rounded-2xl" />
              <div className="h-24 bg-white border border-slate-200/80 rounded-2xl" />
            </div>
          </div>
        )}

        {!loading && weather && (
          <div className="mt-5">
            <CurrentWeatherCard weather={weather} unit={unit} />

            <WarmAlertBanner
              warmDays={warmAlertDays}
              thresholdC={user?.warmThresholdC ?? 20}
              unit={unit}
            />

            <ForecastList forecast={weather.forecast} unit={unit} />

            <div className="mt-4 flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                Parsed in {weather.meta.parseMs} ms
                {weather.meta.quotaRemaining !== null
                  ? ` · Daily quota left: ${weather.meta.quotaRemaining}`
                  : ''}
              </span>
              <button
                type="button"
                onClick={() => loadForCoords(weather.location, { forceRefresh: true })}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>
        )}
      </main>

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        user={user}
        unit={unit}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onUpdatePreferences={handleUpdatePreferences}
        onSelectRecommendedCity={handleSelectRecommendedCity}
      />
    </div>
  );
}
