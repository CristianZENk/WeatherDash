import { useState } from 'react';
import { Bell, Flame, MapPin, Sliders, X } from 'lucide-react';
import { formatTemperature } from '../services/weatherApi';
import { getTopRecommendedCities } from '../services/userStore';

export function AccountModal({
  isOpen,
  onClose,
  user,
  unit,
  onLogin,
  onRegister,
  onUpdatePreferences,
  onSelectRecommendedCity,
}) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [weatherPreference, setWeatherPreference] = useState(user?.weatherPreference || 'warm');
  const [warmThresholdC, setWarmThresholdC] = useState(user?.warmThresholdC ?? 20);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const topCities = user ? getTopRecommendedCities(user, 5) : [];

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (mode === 'login') {
        onLogin({ username, password });
      } else {
        onRegister({
          username,
          password,
          weatherPreference,
          warmThresholdC,
          preferredUnit: unit,
        });
      }
      setUsername('');
      setPassword('');
      onClose();
    } catch (err) {
      setFormError(err.message || 'Authentication failed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-label={user ? 'Account preferences' : 'Sign in or create account'}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">
              {user ? `Preferences — ${user.username}` : 'WeatherDash Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!user ? (
          <div>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFormError('');
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFormError('');
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              {mode === 'register' && (
                <div className="pt-1 space-y-3 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Weather Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'warm', label: 'Warm' },
                        { id: 'balanced', label: 'Balanced' },
                        { id: 'cool', label: 'Cool' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setWeatherPreference(opt.id)}
                          className={`py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            weatherPreference === opt.id
                              ? 'border-sky-500 bg-sky-50 text-sky-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {weatherPreference === 'warm' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Warm Alert Threshold</span>
                        <span className="font-semibold text-amber-600">
                          ≥ {formatTemperature(warmThresholdC, unit)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="32"
                        value={warmThresholdC}
                        onChange={(e) => setWarmThresholdC(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <p className="text-xs text-rose-600 font-medium" role="alert">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition cursor-pointer"
              >
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Climate Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'warm', label: 'Warm' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'cool', label: 'Cool' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdatePreferences({
                        weatherPreference: opt.id,
                        warmAlertEnabled: opt.id === 'warm' ? true : user.warmAlertEnabled,
                      })
                    }
                    className={`py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      user.weatherPreference === opt.id
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  <span className="text-xs font-semibold text-slate-800">
                    Warm Weather Forecast Alerts
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(user.warmAlertEnabled)}
                  onClick={() =>
                    onUpdatePreferences({ warmAlertEnabled: !user.warmAlertEnabled })
                  }
                  className={`w-10 h-5.5 rounded-full transition p-0.5 cursor-pointer ${
                    user.warmAlertEnabled ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                      user.warmAlertEnabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {user.warmAlertEnabled && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-600" aria-hidden="true" />
                      Alert when forecast reaches
                    </span>
                    <span className="font-bold text-amber-700">
                      ≥ {formatTemperature(user.warmThresholdC ?? 20, unit)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="32"
                    value={user.warmThresholdC ?? 20}
                    onChange={(e) =>
                      onUpdatePreferences({ warmThresholdC: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Your Frequent Cities
              </p>
              {topCities.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Search for cities while logged in to build personalized recommendations.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topCities.map((entry) => (
                    <button
                      key={`${entry.location.name}-${entry.location.country}`}
                      type="button"
                      onClick={() => {
                        onSelectRecommendedCity(entry.location);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-xs font-medium text-slate-700 transition cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-sky-600" aria-hidden="true" />
                      <span>{entry.location.name}</span>
                      <span className="text-slate-400">({entry.count}×)</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
