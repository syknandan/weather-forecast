// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    API_KEY: 'a09f56d18801872614527da3c0870c93', // Replace with your OpenWeatherMap API key
    UNITS: 'metric',
    LANG: 'en'
};

/**
 * Fetches current weather data for a given city
 * @param {string} city - City name
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(city) {
    try {
        const url = `${API_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Failed to fetch weather data: ${response.statusText}`);
            }
        }

        const data = await response.json();
        return formatCurrentWeather(data);
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

/**
 * Fetches current weather data by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeatherByCoords(lat, lon) {
    try {
        const url = `${API_CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch weather data: ${response.statusText}`);
        }

        const data = await response.json();
        return formatCurrentWeather(data);
    } catch (error) {
        console.error('Error fetching current weather by coords:', error);
        throw error;
    }
}

/**
 * Fetches 5-day weather forecast
 * @param {string} city - City name
 * @returns {Promise<Array>} Forecast data
 */
export async function getForecast(city) {
    try {
        const url = `${API_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch forecast data: ${response.statusText}`);
        }

        const data = await response.json();
        return formatForecast(data);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

/**
 * Fetches 5-day weather forecast by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Forecast data
 */
export async function getForecastByCoords(lat, lon) {
    try {
        const url = `${API_CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch forecast data: ${response.statusText}`);
        }

        const data = await response.json();
        return formatForecast(data);
    } catch (error) {
        console.error('Error fetching forecast by coords:', error);
        throw error;
    }
}

/**
 * Searches for cities matching the query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching cities
 */
export async function searchCities(query) {
    try {
        // Using the weather endpoint as a simple city search
        const url = `${API_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(query)}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return [{
            name: data.name,
            country: data.sys.country,
            lat: data.coord.lat,
            lon: data.coord.lon
        }];
    } catch (error) {
        console.error('Error searching cities:', error);
        return [];
    }
}

/**
 * Formats current weather data
 * @param {Object} data - Raw API response
 * @returns {Object} Formatted weather data
 */
function formatCurrentWeather(data) {
    return {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        main: data.weather[0].main,
        timestamp: data.dt * 1000,
        sunrise: data.sys.sunrise * 1000,
        sunset: data.sys.sunset * 1000,
        coords: {
            lat: data.coord.lat,
            lon: data.coord.lon
        }
    };
}

/**
 * Formats forecast data
 * @param {Object} data - Raw API response
 * @returns {Array} Formatted forecast array
 */
function formatForecast(data) {
    // Group forecasts by day and get one forecast per day (at noon)
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        const hour = date.getHours();

        // Get the forecast closest to noon (12:00)
        if (!dailyForecasts[dateKey] || Math.abs(hour - 12) < Math.abs(new Date(dailyForecasts[dateKey].timestamp).getHours() - 12)) {
            dailyForecasts[dateKey] = {
                date: dateKey,
                timestamp: item.dt * 1000,
                temperature: Math.round(item.main.temp),
                tempMin: Math.round(item.main.temp_min),
                tempMax: Math.round(item.main.temp_max),
                humidity: item.main.humidity,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                main: item.weather[0].main,
                windSpeed: Math.round(item.wind.speed * 3.6)
            };
        }
    });

    // Convert to array and take first 5 days
    return Object.values(dailyForecasts).slice(0, 5);
}

/**
 * Gets weather icon emoji based on icon code
 * @param {string} iconCode - OpenWeatherMap icon code
 * @returns {string} Weather emoji
 */
export function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️',  // clear sky day
        '01n': '🌙',  // clear sky night
        '02d': '⛅',  // few clouds day
        '02n': '☁️',  // few clouds night
        '03d': '☁️',  // scattered clouds
        '03n': '☁️',
        '04d': '☁️',  // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain day
        '10n': '🌧️', // rain night
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '❄️',  // snow
        '13n': '❄️',
        '50d': '🌫️', // mist
        '50n': '🌫️'
    };

    return iconMap[iconCode] || '🌡️';
}

/**
 * Formats date to readable string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Gets day name from timestamp
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Day name
 */
export function getDayName(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
}