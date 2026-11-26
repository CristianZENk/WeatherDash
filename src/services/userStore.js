const USERS_KEY = 'weatherdash_users_v1';
const SESSION_KEY = 'weatherdash_session_v1';

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage quota errors
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function getCurrentSessionUser() {
  try {
    const sessionKey = localStorage.getItem(SESSION_KEY);
    if (!sessionKey) return null;
    const users = readUsers();
    return users[sessionKey] || null;
  } catch {
    return null;
  }
}

export function registerUser({ username, password, weatherPreference = 'warm', warmThresholdC = 20, preferredUnit = 'metric' }) {
  const cleanName = username.trim();
  const key = normalizeUsername(cleanName);

  if (cleanName.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }

  const users = readUsers();
  if (users[key]) {
    throw new Error('An account with this username already exists.');
  }

  const newUser = {
    username: cleanName,
    password,
    preferredUnit,
    weatherPreference,
    warmAlertEnabled: weatherPreference === 'warm',
    warmThresholdC,
    searchHistory: {},
    createdAt: new Date().toISOString(),
  };

  users[key] = newUser;
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, key);
  return newUser;
}

export function loginUser({ username, password }) {
  const key = normalizeUsername(username);
  if (!key || !password) {
    throw new Error('Please enter both username and password.');
  }

  const users = readUsers();
  const user = users[key];
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password.');
  }

  localStorage.setItem(SESSION_KEY, key);
  return user;
}

export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function updateUserPreferences(username, updates) {
  const key = normalizeUsername(username);
  const users = readUsers();
  const existing = users[key];
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
  };
  users[key] = updated;
  writeUsers(users);
  return updated;
}

export function recordCitySearch(username, locationInfo) {
  if (!username || !locationInfo?.name) return null;
  const key = normalizeUsername(username);
  const users = readUsers();
  const existing = users[key];
  if (!existing) return null;

  const cityKey = `${locationInfo.name.toLowerCase()}|${(locationInfo.country || '').toLowerCase()}`;
  const history = { ...(existing.searchHistory || {}) };
  const prev = history[cityKey];

  history[cityKey] = {
    location: locationInfo,
    count: (prev?.count || 0) + 1,
    lastSearchedAt: new Date().toISOString(),
  };

  const updated = {
    ...existing,
    searchHistory: history,
  };
  users[key] = updated;
  writeUsers(users);
  return updated;
}

export function getTopRecommendedCities(user, limit = 3) {
  if (!user?.searchHistory) return [];
  return Object.values(user.searchHistory)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.lastSearchedAt).getTime() - new Date(a.lastSearchedAt).getTime();
    })
    .slice(0, limit);
}

export function getWarmForecastAlerts(user, forecast) {
  if (!user || !Array.isArray(forecast) || forecast.length === 0) return [];
  const wantsWarmAlert = user.weatherPreference === 'warm' || user.warmAlertEnabled;
  if (!wantsWarmAlert) return [];

  const thresholdC = typeof user.warmThresholdC === 'number' ? user.warmThresholdC : 20;
  return forecast.filter((day) => day.maxC >= thresholdC);
}
