import { useEffect, useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import ErrorBanner from './components/ErrorBanner';
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  hasValidApiKey,
} from './services/weatherService';
import {
  getSavedCity,
  saveCity,
  getSavedUnit,
  saveUnit,
  getCurrentCoordinates,
} from './utils/storage';

const DEFAULT_FALLBACK_CITY = 'London';

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [unit, setUnit] = useState(() => getSavedUnit());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadByCity = useCallback(async (city, targetUnit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeatherByCity(city, targetUnit);
      setWeatherData(result.current);
      setForecastData(result.forecast);
      saveCity(result.current.city);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByGeolocation = useCallback(async (targetUnit) => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = await getCurrentCoordinates();
      const result = await fetchWeatherByCoords(lat, lon, targetUnit);
      setWeatherData(result.current);
      setForecastData(result.forecast);
      saveCity(result.current.city);
    } catch {
      // Graceful fallback to default city if geolocation is denied or unavailable
      await loadByCity(DEFAULT_FALLBACK_CITY, targetUnit);
      return;
    }
    setLoading(false);
  }, [loadByCity]);

  useEffect(() => {
    const savedCity = getSavedCity();
    if (savedCity) {
      loadByCity(savedCity, unit);
    } else {
      loadByGeolocation(unit);
    }
    // Run only on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(query) {
    loadByCity(query, unit);
  }

  function handleUseLocation() {
    loadByGeolocation(unit);
  }

  function handleUnitToggle(nextUnit) {
    setUnit(nextUnit);
    saveUnit(nextUnit);
    const activeCity = weatherData?.city || getSavedCity() || DEFAULT_FALLBACK_CITY;
    loadByCity(activeCity, nextUnit);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              WeatherDash
            </h1>
            <p className="text-xs text-slate-500">
              Minimal real-time weather &amp; 3-day outlook
            </p>
          </div>
          <UnitToggle unit={unit} onToggle={handleUnitToggle} disabled={loading} />
        </header>

        <main className="space-y-5">
          <SearchBar
            onSearch={handleSearch}
            onUseLocation={handleUseLocation}
            loading={loading}
          />

          <ErrorBanner
            error={error}
            loading={loading}
            onDismiss={() => setError(null)}
          />

          {!weatherData && loading ? (
            <div className="h-56 animate-pulse rounded-2xl border border-slate-200/70 bg-white/80" />
          ) : (
            <>
              <CurrentWeather data={weatherData} unit={unit} />
              <ForecastList forecast={forecastData} unit={unit} />
            </>
          )}
        </main>

        <footer className="mt-10 border-t border-slate-200/70 pt-4 text-center text-xs text-slate-400">
          {hasValidApiKey() ? (
            <span>Powered by OpenWeatherMap REST API</span>
          ) : (
            <span>
              Prototype Demo Mode active · Add{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">
                VITE_OPENWEATHER_API_KEY
              </code>{' '}
              in <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">.env</code> for live data
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
