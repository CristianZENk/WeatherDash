# WeatherDash

A minimalist, responsive web dashboard for real-time weather conditions and a 3-day forecast, built with **React**, **Vite**, and **Tailwind CSS**.

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── CurrentWeatherCard.jsx
│   │   ├── ForecastList.jsx
│   │   ├── SearchBar.jsx
│   │   ├── UnitToggle.jsx
│   │   └── WeatherIcon.jsx
│   ├── services/
│   │   └── weatherApi.js             # Geocoding + Stormglass API v2 + caching
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── HOW_TO_RUN.txt
├── index.html
├── package.json
├── vite.config.js
└── Report 2 - Intermediary - WeatherDash.pdf
```

## Features

- **City & ZIP Code Search**: Global location lookup via Open-Meteo Geocoding with Nominatim fallback for postal/ZIP codes.
- **Current Weather**: Real-time temperature, descriptive condition icon, humidity percentage, and wind speed.
- **3-Day Forecast**: Aggregated daily min/max temperatures and weather conditions.
- **Metric / Imperial Toggle**: Instant `°C` / `°F` and `km/h` / `mph` conversion persisted in `localStorage`.
- **Geolocation & Persistence**: Auto-detects user coordinates via HTML5 Geolocation on first visit and remembers the last searched city.
- **Quota-Aware Caching**: Caches API responses for 60 minutes in `localStorage` and includes a graceful error banner with Demo Mode fallback.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your environment file from the template and add your Stormglass API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   VITE_STORMGLASS_API_KEY=your_stormglass_api_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
