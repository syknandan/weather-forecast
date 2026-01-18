# Weather App - Internship Project

A modern, responsive weather application built with vanilla JavaScript that fetches real-time weather data from the OpenWeatherMap API. This project demonstrates key concepts including async/await, API integration, Local Storage persistence, debouncing, and responsive design.

![Weather App Screenshot](screenshots/main-view.png)

## 🌟 Features

### Core Features
- **Real-time Weather Data**: Get current weather conditions for any city
- **5-Day Forecast**: View upcoming weather predictions
- **Current Location**: Automatically detect and display weather for your location
- **City Search**: Smart search with debouncing for better performance
- **Favorite Cities**: Save and quickly access your favorite locations
- **Dark/Light Theme**: Toggle between dark and light modes with persistence
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels and keyboard navigation support

### Technical Features
- Async/await for API calls
- Local Storage for data persistence
- Debouncing for search optimization
- Error handling and loading states
- Geolocation API integration
- Clean, modular code structure

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Variables, Flexbox, and Grid
- **JavaScript (ES6+)**: Modules, async/await, fetch API
- **OpenWeatherMap API**: Weather data source
- **Local Storage**: Client-side data persistence

## 📁 Project Structure

```
weather-app/
│
├── index.html              # Main HTML file
├── README.md              # Project documentation
│
├── css/
│   └── styles.css         # All styles with CSS variables
│
├── js/
│   ├── app.js            # Main application logic
│   ├── api.js            # API calls and data formatting
│   └── storage.js        # Local Storage management
│
└── screenshots/
    ├── main-view.png
    ├── forecast.png
    └── mobile-view.png
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenWeatherMap API key (free tier available)
- A local server or live server extension

### Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Get your API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

3. **Configure the API key**
   - Open `js/api.js`
   - Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'https://api.openweathermap.org/data/2.5',
       API_KEY: 'your_actual_api_key_here',
       UNITS: 'metric',
       LANG: 'en'
   };
   ```

4. **Run the application**
   - Open `index.html` in a web browser, or
   - Use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using VS Code Live Server extension
   Right-click index.html → Open with Live Server
   ```

5. **Access the app**
   - Open your browser and navigate to `http://localhost:8000`

## 💡 Usage

### Search for a City
1. Type a city name in the search box
2. Select from the suggestions or press Enter
3. View current weather and 5-day forecast

### Use Current Location
1. Click the "Current Location" button
2. Allow location access when prompted
3. View weather for your current location

### Save Favorite Cities
1. Search for a city
2. Click the heart icon to add to favorites
3. Access favorites quickly from the favorites section

### Toggle Theme
- Click the sun/moon icon in the header to switch between light and dark themes
- Your preference is automatically saved

## 🎯 Key Concepts Demonstrated

### 1. Async/Await Pattern
```javascript
async function getCurrentWeather(city) {
    const response = await fetch(url);
    const data = await response.json();
    return formatCurrentWeather(data);
}
```

### 2. Debouncing
```javascript
let debounceTimer = null;
clearTimeout(debounceTimer);
debounceTimer = setTimeout(() => {
    searchForCities(value);
}, 500);
```

### 3. Local Storage Persistence
```javascript
function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}
```

### 4. Error Handling
```javascript
try {
    const weather = await getCurrentWeather(city);
    displayWeather(weather);
} catch (error) {
    showError(error.message);
}
```

### 5. Responsive Design
- Fluid layouts with CSS Grid and Flexbox
- Mobile-first approach
- Breakpoints for tablets and desktops

## 📱 Responsive Breakpoints

- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: > 768px

## ♿ Accessibility Features

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Reduced motion support

## 🐛 Error Handling

The app handles various error scenarios:
- Invalid city names
- Network errors
- API key issues
- Geolocation permission denied
- No internet connection

## 🔒 Privacy & Data

- No personal data is collected
- Weather preferences stored locally
- Location data used only for weather lookup
- No cookies or tracking

## 🚧 Future Enhancements

- [ ] Hourly forecast
- [ ] Weather alerts and warnings
- [ ] Multiple unit systems (Imperial/Metric)
- [ ] Weather maps
- [ ] Historical weather data
- [ ] Share weather on social media
- [ ] Weather widgets
- [ ] Offline support with Service Workers

## 📚 Learning Resources

- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs - Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 🤝 Contributing

This is an internship project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

