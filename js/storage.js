// Storage keys
const STORAGE_KEYS = {
    LAST_CITY: 'weather_last_city',
    FAVORITE_CITIES: 'weather_favorite_cities',
    THEME: 'weather_theme',
    UNIT: 'weather_unit',
    LAST_UPDATE: 'weather_last_update'
};

/**
 * Saves data to Local Storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function saveToStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

/**
 * Retrieves data from Local Storage
 * @param {string} key - Storage key
 * @returns {*} Retrieved value or null
 */
export function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

/**
 * Removes data from Local Storage
 * @param {string} key - Storage key
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from storage:', error);
        return false;
    }
}

/**
 * Clears all app data from Local Storage
 */
export function clearAllStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}

/**
 * Saves the last searched city
 * @param {string} city - City name
 */
export function saveLastCity(city) {
    return saveToStorage(STORAGE_KEYS.LAST_CITY, {
        name: city,
        timestamp: Date.now()
    });
}

/**
 * Gets the last searched city
 * @returns {Object|null} Last city data
 */
export function getLastCity() {
    return getFromStorage(STORAGE_KEYS.LAST_CITY);
}

/**
 * Adds a city to favorites
 * @param {Object} cityData - City data object
 * @returns {boolean} Success status
 */
export function addFavoriteCity(cityData) {
    try {
        const favorites = getFavoriteCities();

        // Check if city already exists
        const exists = favorites.some(fav =>
            fav.name.toLowerCase() === cityData.name.toLowerCase()
        );

        if (exists) {
            console.log('City already in favorites');
            return false;
        }

        // Add new favorite with timestamp
        favorites.push({
            ...cityData,
            addedAt: Date.now()
        });

        return saveToStorage(STORAGE_KEYS.FAVORITE_CITIES, favorites);
    } catch (error) {
        console.error('Error adding favorite city:', error);
        return false;
    }
}

/**
 * Removes a city from favorites
 * @param {string} cityName - City name to remove
 * @returns {boolean} Success status
 */
export function removeFavoriteCity(cityName) {
    try {
        const favorites = getFavoriteCities();
        const filtered = favorites.filter(fav =>
            fav.name.toLowerCase() !== cityName.toLowerCase()
        );

        return saveToStorage(STORAGE_KEYS.FAVORITE_CITIES, filtered);
    } catch (error) {
        console.error('Error removing favorite city:', error);
        return false;
    }
}

/**
 * Gets all favorite cities
 * @returns {Array} Array of favorite cities
 */
export function getFavoriteCities() {
    const favorites = getFromStorage(STORAGE_KEYS.FAVORITE_CITIES);
    return favorites || [];
}

/**
 * Checks if a city is in favorites
 * @param {string} cityName - City name to check
 * @returns {boolean} True if city is favorite
 */
export function isFavoriteCity(cityName) {
    const favorites = getFavoriteCities();
    return favorites.some(fav =>
        fav.name.toLowerCase() === cityName.toLowerCase()
    );
}

/**
 * Updates weather data for a favorite city
 * @param {string} cityName - City name
 * @param {Object} weatherData - Updated weather data
 * @returns {boolean} Success status
 */
export function updateFavoriteCityWeather(cityName, weatherData) {
    try {
        const favorites = getFavoriteCities();
        const index = favorites.findIndex(fav =>
            fav.name.toLowerCase() === cityName.toLowerCase()
        );

        if (index !== -1) {
            favorites[index] = {
                ...favorites[index],
                ...weatherData,
                lastUpdated: Date.now()
            };
            return saveToStorage(STORAGE_KEYS.FAVORITE_CITIES, favorites);
        }

        return false;
    } catch (error) {
        console.error('Error updating favorite city weather:', error);
        return false;
    }
}

/**
 * Saves user theme preference
 * @param {string} theme - Theme name ('light' or 'dark')
 */
export function saveTheme(theme) {
    return saveToStorage(STORAGE_KEYS.THEME, theme);
}

/**
 * Gets user theme preference
 * @returns {string|null} Theme name
 */
export function getTheme() {
    return getFromStorage(STORAGE_KEYS.THEME);
}

/**
 * Saves temperature unit preference
 * @param {string} unit - Unit ('celsius' or 'fahrenheit')
 */
export function saveUnit(unit) {
    return saveToStorage(STORAGE_KEYS.UNIT, unit);
}

/**
 * Gets temperature unit preference
 * @returns {string} Unit name (defaults to 'celsius')
 */
export function getUnit() {
    return getFromStorage(STORAGE_KEYS.UNIT) || 'celsius';
}

/**
 * Saves last update timestamp
 * @param {number} timestamp - Unix timestamp
 */
export function saveLastUpdate(timestamp = Date.now()) {
    return saveToStorage(STORAGE_KEYS.LAST_UPDATE, timestamp);
}

/**
 * Gets last update timestamp
 * @returns {number|null} Unix timestamp
 */
export function getLastUpdate() {
    return getFromStorage(STORAGE_KEYS.LAST_UPDATE);
}

/**
 * Checks if data needs refresh (older than specified minutes)
 * @param {number} minutes - Minutes threshold
 * @returns {boolean} True if refresh needed
 */
export function needsRefresh(minutes = 10) {
    const lastUpdate = getLastUpdate();
    if (!lastUpdate) return true;

    const now = Date.now();
    const diff = now - lastUpdate;
    const threshold = minutes * 60 * 1000; // Convert to milliseconds

    return diff > threshold;
}

/**
 * Gets storage usage statistics
 * @returns {Object} Storage usage info
 */
export function getStorageStats() {
    try {
        let totalSize = 0;
        const stats = {};

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const item = localStorage.getItem(key);
            const size = item ? new Blob([item]).size : 0;
            stats[name] = {
                key,
                size,
                sizeKB: (size / 1024).toFixed(2)
            };
            totalSize += size;
        });

        return {
            items: stats,
            totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    } catch (error) {
        console.error('Error getting storage stats:', error);
        return null;
    }
}

/**
 * Exports all data as JSON
 * @returns {Object} All stored data
 */
export function exportData() {
    try {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = getFromStorage(key);
        });
        return data;
    } catch (error) {
        console.error('Error exporting data:', error);
        return null;
    }
}

/**
 * Imports data from JSON object
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export function importData(data) {
    try {
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            if (data[name] !== undefined) {
                saveToStorage(key, data[name]);
            }
        });
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

// Export storage keys for use in other modules
export { STORAGE_KEYS };