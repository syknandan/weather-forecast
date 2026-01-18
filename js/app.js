// Import modules
import {
    getCurrentWeather,
    getCurrentWeatherByCoords,
    getForecast,
    getForecastByCoords,
    searchCities,
    getWeatherIcon,
    formatDate,
    getDayName
} from './api.js';

import {
    saveLastCity,
    getLastCity,
    addFavoriteCity,
    removeFavoriteCity,
    getFavoriteCities,
    isFavoriteCity,
    updateFavoriteCityWeather,
    saveTheme,
    getTheme,
    saveLastUpdate,
    needsRefresh
} from './storage.js';

// DOM Elements
const elements = {
    citySearch: document.getElementById('citySearch'),
    clearBtn: document.getElementById('clearBtn'),
    suggestions: document.getElementById('suggestions'),
    currentLocationBtn: document.getElementById('currentLocationBtn'),
    themeToggle: document.getElementById('themeToggle'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    weatherContent: document.getElementById('weatherContent'),
    cityName: document.getElementById('cityName'),
    dateTime: document.getElementById('dateTime'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    forecastContainer: document.getElementById('forecastContainer'),
    favoritesSection: document.getElementById('favoritesSection'),
    favoritesContainer: document.getElementById('favoritesContainer')
};

// App State
let currentCity = null;
let debounceTimer = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();
    loadLastCity();
    renderFavorites();
});

/**
 * Initialize theme from storage or system preference
 */
function initializeTheme() {
    const savedTheme = getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Search input with debouncing
    elements.citySearch.addEventListener('input', handleSearchInput);
    elements.citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (value) {
                loadWeatherData(value);
                elements.suggestions.classList.remove('visible');
            }
        }
    });

    // Clear button
    elements.clearBtn.addEventListener('click', () => {
        elements.citySearch.value = '';
        elements.clearBtn.classList.remove('visible');
        elements.suggestions.classList.remove('visible');
    });

    // Current location button
    elements.currentLocationBtn.addEventListener('click', getCurrentLocation);

    // Favorite button
    elements.favoriteBtn.addEventListener('click', toggleFavorite);

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.citySearch.contains(e.target) && !elements.suggestions.contains(e.target)) {
            elements.suggestions.classList.remove('visible');
        }
    });
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    saveTheme(newTheme);
}

/**
 * Handle search input with debouncing
 */
function handleSearchInput(e) {
    const value = e.target.value.trim();

    // Show/hide clear button
    if (value) {
        elements.clearBtn.classList.add('visible');
    } else {
        elements.clearBtn.classList.remove('visible');
        elements.suggestions.classList.remove('visible');
        return;
    }

    // Debounce search
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        if (value.length >= 2) {
            await searchForCities(value);
        }
    }, 500);
}

/**
 * Search for cities matching the query
 */
async function searchForCities(query) {
    try {
        const cities = await searchCities(query);
        displaySuggestions(cities);
    } catch (error) {
        console.error('Search error:', error);
    }
}

/**
 * Display city suggestions
 */
function displaySuggestions(cities) {
    elements.suggestions.innerHTML = '';

    if (cities.length === 0) {
        elements.suggestions.classList.remove('visible');
        return;
    }

    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${city.name}, ${city.country}`;
        item.addEventListener('click', () => {
            elements.citySearch.value = city.name;
            elements.suggestions.classList.remove('visible');
            loadWeatherData(city.name);
        });
        elements.suggestions.appendChild(item);
    });

    elements.suggestions.classList.add('visible');
}

/**
 * Get current location using Geolocation API
 */
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await loadWeatherDataByCoords(latitude, longitude);
            } catch (error) {
                showError('Failed to get weather for your location');
            }
        },
        (error) => {
            hideLoading();
            let message = 'Unable to retrieve your location';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out.';
                    break;
            }

            showError(message);
        }
    );
}

/**
 * Load weather data for a city
 */
async function loadWeatherData(city) {
    try {
        showLoading();
        hideError();

        const [weather, forecast] = await Promise.all([
            getCurrentWeather(city),
            getForecast(city)
        ]);

        currentCity = weather;
        displayWeather(weather, forecast);
        saveLastCity(city);
        saveLastUpdate();

        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

/**
 * Load weather data by coordinates
 */
async function loadWeatherDataByCoords(lat, lon) {
    try {
        showLoading();
        hideError();

        const [weather, forecast] = await Promise.all([
            getCurrentWeatherByCoords(lat, lon),
            getForecastByCoords(lat, lon)
        ]);

        currentCity = weather;
        displayWeather(weather, forecast);
        saveLastCity(weather.city);
        saveLastUpdate();

        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

/**
 * Display weather data
 */
function displayWeather(weather, forecast) {
    // Update current weather
    elements.cityName.textContent = `${weather.city}, ${weather.country}`;
    elements.dateTime.textContent = formatDate(weather.timestamp);
    elements.weatherIcon.textContent = getWeatherIcon(weather.icon);
    elements.temperature.textContent = weather.temperature;
    elements.weatherDescription.textContent = weather.description;
    elements.feelsLike.textContent = `${weather.feelsLike}°C`;
    elements.humidity.textContent = `${weather.humidity}%`;
    elements.windSpeed.textContent = `${weather.windSpeed} km/h`;
    elements.pressure.textContent = `${weather.pressure} hPa`;

    // Update favorite button state
    updateFavoriteButton();

    // Display forecast
    displayForecast(forecast);

    // Show weather content
    elements.weatherContent.classList.add('visible');
}

/**
 * Display forecast data
 */
function displayForecast(forecast) {
    elements.forecastContainer.innerHTML = '';

    forecast.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${getDayName(day.timestamp)}</div>
            <div class="forecast-icon">${getWeatherIcon(day.icon)}</div>
            <div class="forecast-temp">
                <span class="temp-high">${day.tempMax}°</span>
                <span class="temp-low">${day.tempMin}°</span>
            </div>
            <div class="forecast-desc">${day.description}</div>
        `;
        elements.forecastContainer.appendChild(card);
    });
}

/**
 * Toggle favorite status for current city
 */
function toggleFavorite() {
    if (!currentCity) return;

    const isFav = isFavoriteCity(currentCity.city);

    if (isFav) {
        removeFavoriteCity(currentCity.city);
    } else {
        addFavoriteCity({
            name: currentCity.city,
            country: currentCity.country,
            temperature: currentCity.temperature,
            icon: currentCity.icon,
            coords: currentCity.coords
        });
    }

    updateFavoriteButton();
    renderFavorites();
}

/**
 * Update favorite button appearance
 */
function updateFavoriteButton() {
    if (!currentCity) return;

    const isFav = isFavoriteCity(currentCity.city);

    if (isFav) {
        elements.favoriteBtn.classList.add('active');
        elements.favoriteBtn.setAttribute('aria-label', 'Remove from favorites');
    } else {
        elements.favoriteBtn.classList.remove('active');
        elements.favoriteBtn.setAttribute('aria-label', 'Add to favorites');
    }
}

/**
 * Render favorite cities
 */
function renderFavorites() {
    const favorites = getFavoriteCities();

    if (favorites.length === 0) {
        elements.favoritesSection.classList.remove('visible');
        return;
    }

    elements.favoritesSection.classList.add('visible');
    elements.favoritesContainer.innerHTML = '';

    favorites.forEach(city => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <div class="favorite-city-name">${city.name}</div>
            <div class="favorite-temp">${city.temperature}°C ${getWeatherIcon(city.icon)}</div>
            <button class="favorite-remove" aria-label="Remove ${city.name} from favorites">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        // Click card to load weather
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-remove')) {
                loadWeatherData(city.name);
            }
        });

        // Remove button
        const removeBtn = card.querySelector('.favorite-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFavoriteCity(city.name);
            renderFavorites();
            updateFavoriteButton();
        });

        elements.favoritesContainer.appendChild(card);
    });
}

/**
 * Load last searched city on app start
 */
function loadLastCity() {
    const lastCity = getLastCity();

    if (lastCity && lastCity.name) {
        // Check if data needs refresh
        if (needsRefresh(10)) {
            loadWeatherData(lastCity.name);
        } else {
            // Still load but without showing loading state
            loadWeatherData(lastCity.name);
        }
    }
}

/**
 * Show loading state
 */
function showLoading() {
    elements.loading.classList.add('visible');
    elements.weatherContent.classList.remove('visible');
    elements.errorMessage.classList.remove('visible');
}

/**
 * Hide loading state
 */
function hideLoading() {
    elements.loading.classList.remove('visible');
}

/**
 * Show error message
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.add('visible');
    elements.weatherContent.classList.remove('visible');
}

/**
 * Hide error message
 */
function hideError() {
    elements.errorMessage.classList.remove('visible');
}