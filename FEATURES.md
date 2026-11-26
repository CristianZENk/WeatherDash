# WeatherDash — Current Functionalities

A concise overview of all implemented features in the current **WeatherDash** prototype.

## 1. Weather Search & Location
- **City & ZIP Code Search**: Search any global city or postal/ZIP code (via Open-Meteo Geocoding with OpenStreetMap Nominatim fallback).
- **Auto-Detection (Geolocation)**: Uses the HTML5 Geolocation API on initial load to detect the user's local weather (with reverse geocoding for the city name).
- **Last City Persistence**: Automatically saves and restores the last viewed city in `localStorage`.

## 2. Current Weather & 3-Day Forecast
- **Current Conditions**: Displays temperature, weather condition label, descriptive icon, humidity percentage, and wind speed using the **Stormglass API v2**.
- **3-Day Forecast**: Aggregates hourly forecast data into daily minimum/maximum temperatures and overall conditions for the next 3 days.
- **Quota-Safe Caching & Demo Mode**: Caches API responses for 60 minutes in `localStorage` to protect daily API limits, and includes a **Load Demo Data** fallback if the quota is reached or the API key is missing.

## 3. Units & Responsive UI
- **Metric / Imperial Toggle**: Switches instantaneously between `°C` / `km/h` and `°F` / `mph` without making extra API calls.
- **Minimalist Responsive Design**: Single-column layout built with React and Tailwind CSS that adapts cleanly between desktop and mobile screens.

## 4. User Accounts & Personalized Recommendations
- **Account System**: Create an account, log in, and log out (`localStorage`-persisted profiles and sessions).
- **Saved Preferences**: Stores each user's preferred temperature unit (`°C` / `°F`), climate preference (`Warm`, `Balanced`, `Cool`), and alert settings.
- **Weather Forecast Alerts & Recommendations**:
  - **Warm Weather Alert**: Alerts when upcoming forecast highs reach the user's warm threshold (default `≥ 20°C`, adjustable).
  - **Cold Weather Alert**: Alerts when upcoming forecast lows drop to the user's cold threshold (default `≤ 5°C`, adjustable).
  - **Rain & Snow Alerts**: Highlights upcoming rainy or snowy days with practical preparation tips (umbrella/waterproof jacket for rain, warm layers/extra travel time for snow).
- **Frequent City Recommendations**: Tracks how often a logged-in user searches each city and recommends their most-searched cities on login with one-click loading.
