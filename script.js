class WeatherApp {
  constructor() {
    this.isCelsius = true;
    this.currentData = null;
    this.searchInput = document.getElementById("searchInput");
    this.refreshBtn = document.getElementById("refreshBtn");
    this.tempToggle = document.getElementById("tempToggle");
    this.weatherMain = document.getElementById("weatherMain");
    this.loading = document.getElementById("loading");

    this.init();
  }

  init() {
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchWeather();
      }
    });

    this.refreshBtn.addEventListener("click", () => {
      this.searchWeather();
    });

    this.tempToggle.addEventListener("click", () => {
      this.toggleTemperature();
    });

    // Load default weather for Delhi
    this.loadWeatherByCoords(28.6139, 77.209, "Delhi, IN");
  }

  async searchWeather() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.showLoading();

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        this.showError("Location not found");
        return;
      }

      const location = geoData.results[0];
      const locationName = `${location.name}, ${location.country}`;

      await this.loadWeatherByCoords(
        location.latitude,
        location.longitude,
        locationName
      );
    } catch (error) {
      this.showError("Failed to fetch weather data");
    }
  }

  async loadWeatherByCoords(lat, lon, locationName) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`
      );

      const data = await response.json();
      this.currentData = { ...data, locationName };
      this.searchInput.value = locationName;
      this.displayWeather();
    } catch (error) {
      this.showError("Failed to fetch weather data");
    }
  }

  displayWeather() {
    if (!this.currentData) return;

    const current = this.currentData.current;
    const temp = this.isCelsius
      ? current.temperature_2m
      : (current.temperature_2m * 9) / 5 + 32;
    const weatherCondition = this.getWeatherCondition(current.weather_code);
    const weatherIcon = this.getWeatherIcon(current.weather_code);

    this.weatherMain.innerHTML = `

                <div class="weatherr">
                    <div class="weather-icon">
                        ${weatherIcon}
                    </div>
                    <div class="temperature">${Math.round(temp)}°</div>
                </div>
                    <div class="condition">${weatherCondition}</div>
                    <div class="weather-stats">
                        <div class="stat-item">
                            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                            </svg>
                            <div class="stat-value">${Math.round(
                              current.wind_speed_10m
                            )}</div>
                            <div class="stat-unit">km/h</div>
                        </div>
                        <div class="stat-item">
                            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <div class="stat-value">${
                              current.relative_humidity_2m
                            }%</div>
                        </div>
                        <div class="stat-item">
                            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                                <path d="M8 19v1m0 0v1m0-2h1m-1 0h-1m5-6v1m0 0v1m0-2h1m-1 0h-1"></path>
                            </svg>
                            <div class="stat-value">${
                              current.precipitation_probability
                            }%</div>
                        </div>
                    </div>
                `;
  }

  getWeatherCondition(code) {
    const conditions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };
    return conditions[code] || "Unknown";
  }

  getWeatherIcon(code) {
    if (code === 0 || code === 1) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>`;
    } else if (code === 2) {
      return `<svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" stroke="#FFD700" stroke-width="2" fill="none"></circle>
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#87CEEB" stroke-width="2" fill="#87CEEB" opacity="0.7"></path>
                    </svg>`;
    } else if (code === 3) {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="#87CEEB" stroke-width="2">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#87CEEB" opacity="0.7"></path>
                    </svg>`;
    } else if (code >= 51 && code <= 65) {
      return `<svg viewBox="0 0 24 24" fill="none">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#87CEEB" stroke-width="2" fill="#87CEEB" opacity="0.7"></path>
                        <line x1="8" y1="19" x2="8" y2="21" stroke="#4A90E2" stroke-width="2"></line>
                        <line x1="12" y1="17" x2="12" y2="19" stroke="#4A90E2" stroke-width="2"></line>
                        <line x1="16" y1="19" x2="16" y2="21" stroke="#4A90E2" stroke-width="2"></line>
                    </svg>`;
    } else {
      return `<svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="5" stroke="#FFD700" stroke-width="2" fill="none"></circle>
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#87CEEB" stroke-width="2" fill="#87CEEB" opacity="0.5"></path>
                    </svg>`;
    }
  }

  toggleTemperature() {
    this.isCelsius = !this.isCelsius;
    this.tempToggle.textContent = this.isCelsius ? "°C" : "°F";
    if (this.currentData) {
      this.displayWeather();
    }
  }

  showLoading() {
    this.weatherMain.innerHTML =
      '<div class="loading">Loading weather...</div>';
  }

  showError(message) {
    this.weatherMain.innerHTML = `<div class="error">${message}</div>`;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
