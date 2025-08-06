import { saveState } from './storage.js';

// ✅ WEATHERAPI - Plus simple et fiable qu'OpenWeatherMap
const WEATHER_API_KEY = 'e8c92a9200ea4312b1384114250608'; // Clé gratuite sur weatherapi.com
const LOCATION = 'La Rochelle, France';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1';

// ✅ DONNÉES DE FALLBACK AMÉLIORÉES (3 jours au lieu de 10)
const fallbackWeatherData = {
    data: [
        { 
            date: "2025-08-06", 
            day_of_week: "mercredi", 
            description: "Plutôt nuageux", 
            temperature_max_celsius: 27, 
            temperature_min_celsius: 17, 
            icon: "03d",
            condition: "Partly cloudy"
        },
        { 
            date: "2025-08-07", 
            day_of_week: "jeudi", 
            description: "Ensoleillé", 
            temperature_max_celsius: 28, 
            temperature_min_celsius: 18, 
            icon: "01d",
            condition: "Sunny"
        },
        { 
            date: "2025-08-08", 
            day_of_week: "vendredi", 
            description: "Averses éparses", 
            temperature_max_celsius: 25, 
            temperature_min_celsius: 19, 
            icon: "09d",
            condition: "Patchy rain possible"
        }
    ]
};

export async function fetchWeatherData() {
    const refreshButton = document.getElementById('refreshWeatherBtn');
    if (refreshButton) {
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshButton.disabled = true;
    }
    
    showNotification('🔄 Récupération météo...');
    
    try {
        if (!window.appState.state.isOnline) {
            throw new Error('Mode hors-ligne actif');
        }
        
        if (WEATHER_API_KEY === 'YOUR_WEATHERAPI_KEY_HERE') {
            throw new Error('Clé WeatherAPI non configurée - utilisation des données de test');
        }
        
        // ✅ WEATHERAPI - Un seul appel pour 3 jours
        const response = await fetch(
            `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(LOCATION)}&days=3&aqi=no&alerts=no`
        );
        
        if (!response.ok) {
            throw new Error(`Erreur WeatherAPI: ${response.status}`);
        }
        
        const data = await response.json();
        
        // ✅ TRANSFORMATION EN FORMAT SIMPLE
        window.weatherData = {
            data: data.forecast.forecastday.map((day, index) => {
                const date = new Date(day.date);
                return {
                    date: day.date,
                    day_of_week: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
                    description: translateCondition(day.day.condition.text),
                    temperature_max_celsius: Math.round(day.day.maxtemp_c),
                    temperature_min_celsius: Math.round(day.day.mintemp_c),
                    icon: getOpenWeatherIcon(day.day.condition.code, day.day.condition.text),
                    condition: day.day.condition.text
                };
            })
        };
        
        updateLastUpdateTime();
        renderWeatherWidget();
        setWeatherMode(window.appState.state.weatherMode);
        showNotification('✅ Météo actualisée !');
        if (window.successSound) window.successSound();
        
    } catch (error) {
        console.warn('Erreur météo:', error.message);
        if (window.appState && window.appState.handleError) {
            window.appState.handleError(error, 'fetchWeatherData');
        }
        
        // ✅ FALLBACK SILENCIEUX
        window.weatherData = fallbackWeatherData;
        updateLastUpdateTime();
        renderWeatherWidget();
        showNotification('📱 Données météo de test utilisées');
        
    } finally {
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshButton.disabled = false;
        }
    }
}

// ✅ TRADUCTIONS FRANÇAISES
function translateCondition(condition) {
    const translations = {
        'Sunny': 'Ensoleillé',
        'Clear': 'Clair',
        'Partly cloudy': 'Plutôt nuageux',
        'Cloudy': 'Nuageux',
        'Overcast': 'Couvert',
        'Mist': 'Brouillard léger',
        'Fog': 'Brouillard',
        'Light rain': 'Pluie légère',
        'Moderate rain': 'Pluie modérée',
        'Heavy rain': 'Forte pluie',
        'Patchy rain possible': 'Averses éparses possibles',
        'Light rain shower': 'Averse légère',
        'Thundery outbreaks possible': 'Orages possibles'
    };
    return translations[condition] || condition;
}

// ✅ CORRESPONDANCE ICÔNES OPENWEATHER
function getOpenWeatherIcon(code, condition) {
    const iconMap = {
        1000: '01d', // Sunny
        1003: '02d', // Partly cloudy
        1006: '03d', // Cloudy
        1009: '04d', // Overcast
        1030: '50d', // Mist
        1063: '10d', // Patchy rain possible
        1066: '13d', // Patchy snow possible
        1069: '13d', // Patchy sleet possible
        1072: '13d', // Patchy freezing drizzle possible
        1087: '11d', // Thundery outbreaks possible
        1114: '13d', // Blowing snow
        1117: '13d', // Blizzard
        1135: '50d', // Fog
        1147: '50d', // Freezing fog
        1150: '09d', // Patchy light drizzle
        1153: '09d', // Light drizzle
        1168: '09d', // Freezing drizzle
        1171: '09d', // Heavy freezing drizzle
        1180: '09d', // Patchy light rain
        1183: '09d', // Light rain
        1186: '09d', // Moderate rain at times
        1189: '09d', // Moderate rain
        1192: '10d', // Heavy rain at times
        1195: '10d', // Heavy rain
        1198: '09d', // Light freezing rain
        1201: '09d', // Moderate or heavy freezing rain
        1204: '13d', // Light sleet
        1207: '13d', // Moderate or heavy sleet
        1210: '13d', // Patchy light snow
        1213: '13d', // Light snow
        1216: '13d', // Patchy moderate snow
        1219: '13d', // Moderate snow
        1222: '13d', // Patchy heavy snow
        1225: '13d', // Heavy snow
        1237: '13d', // Ice pellets
        1240: '09d', // Light rain shower
        1243: '10d', // Moderate or heavy rain shower
        1246: '10d', // Torrential rain shower
        1249: '13d', // Light sleet showers
        1252: '13d', // Moderate or heavy sleet showers
        1255: '13d', // Light snow showers
        1258: '13d', // Moderate or heavy snow showers
        1261: '13d', // Light showers of ice pellets
        1264: '13d', // Moderate or heavy showers of ice pellets
        1273: '11d', // Patchy light rain with thunder
        1276: '11d', // Moderate or heavy rain with thunder
        1279: '11d', // Patchy light snow with thunder
        1282: '11d'  // Moderate or heavy snow with thunder
    };
    return iconMap[code] || '01d';
}

function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
        lastUpdateEl.textContent = `Mis à jour: ${new Date().toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        })}`;
    }
}

export function renderWeatherWidget() {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) {
        console.warn('Element weatherForecast introuvable');
        return;
    }
    
    if (!window.weatherData || !window.weatherData.data) {
        console.warn('Données météo non disponibles');
        carousel.innerHTML = '<p style="text-align: center; color: var(--text-light);">Données météo non disponibles</p>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ RENDU OPTIMISÉ - Moins de cartes = plus fluide
    carousel.innerHTML = window.weatherData.data.map((day, index) => {
        const isToday = day.date === today;
        const type = getWeatherType(day.description);
        const isSelected = index === window.appState.state.selectedDayIndex;
        
        return `
            <div class="weather-forecast-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                 onclick="selectDayWeather(${index}, '${type}')"
                 tabindex="0"
                 role="button"
                 aria-label="Sélectionner ${isToday ? 'aujourd\'hui' : day.day_of_week} - ${day.description}">
                <div class="day">${isToday ? 'Aujourd\'hui' : day.day_of_week.substring(0,3)}.</div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${day.icon}.png" 
                         alt="${day.description}" 
                         loading="lazy"
                         onerror="this.style.display='none'">
                </div>
                <div class="temps">${day.temperature_max_celsius}° / ${day.temperature_min_celsius}°</div>
                <div class="description">${day.description}</div>
            </div>`;
    }).join('');
    
    // ✅ FLÈCHES DU CARROUSEL (seulement si nécessaire)
    const carouselContainer = carousel.parentElement;
    if (carouselContainer && !carouselContainer.querySelector('.carousel-arrow') && window.weatherData.data.length > 1) {
        carouselContainer.style.position = 'relative';
        carouselContainer.insertAdjacentHTML('beforeend', `
            <button class="carousel-arrow left" onclick="scrollCarousel(-1)" aria-label="Jour précédent">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-arrow right" onclick="scrollCarousel(1)" aria-label="Jour suivant">
                <i class="fas fa-chevron-right"></i>
            </button>
        `);
    }
    
    // ✅ MISE À JOUR BOUTONS MÉTÉO
    document.querySelectorAll('.weather-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(window.appState.state.weatherMode + 'Btn');
    if (activeBtn) activeBtn.classList.add('active');
    
    // ✅ POSITION CARROUSEL OPTIMISÉE
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) return;
    
    const cardWidth = 110; // Largeur ajustée pour 3 jours
    const visibleCards = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
    const maxData = window.weatherData ? window.weatherData.data.length : 0;
    
    // ✅ MOINS DE CALCULS - 3 jours max
    window.carouselPosition = Math.max(0, Math.min(
        window.appState.state.selectedDayIndex - Math.floor(visibleCards / 2), 
        maxData - visibleCards
    ));
    
    carousel.style.transform = `translateX(-${window.carouselPosition * cardWidth}px)`;
}

export function setWeatherMode(mode) {
    if (!window.weatherData || !window.weatherData.data || 
        !window.weatherData.data[window.appState.state.selectedDayIndex]) {
        console.warn('Données météo non disponibles pour setWeatherMode');
        return;
    }
    
    const selectedDay = window.weatherData.data[window.appState.state.selectedDayIndex];
    window.appState.state.weatherMode = mode === 'auto' ? getWeatherType(selectedDay.description) : mode;
    
    saveState();
    updateWeatherVisibility();
    renderWeatherWidget();
    showWeatherRecommendation(window.appState.state.weatherMode, selectedDay);
}

// ✅ FONCTION GLOBALE OPTIMISÉE
window.selectDayWeather = function(index, type) {
    if (index >= 0 && index < window.weatherData.data.length) {
        window.appState.state.selectedDayIndex = index;
        setWeatherMode('auto');
        if (window.clickSound) window.clickSound();
    }
};

function getWeatherType(description) {
    if (!description) return 'mixed';
    const desc = description.toLowerCase();
    if (desc.includes('pluie') || desc.includes('averse') || desc.includes('orage') || desc.includes('thunder')) {
        return 'rainy';
    }
    if (desc.includes('nuageux') || desc.includes('couvert') || desc.includes('brouillard')) {
        return 'mixed';
    }
    return 'sunny';
}

function updateWeatherVisibility() {
    const mode = window.appState.state.weatherMode;
    document.querySelectorAll('.sunny-weather').forEach(el => {
        el.style.display = (mode === 'sunny' || mode === 'mixed') ? 'block' : 'none';
    });
    document.querySelectorAll('.rainy-weather').forEach(el => {
        el.style.display = (mode === 'rainy' || mode === 'mixed') ? 'block' : 'none';
    });
}

function showWeatherRecommendation(mode, selectedDay) {
    // ✅ SUPPRESSION PROPRE DE L'ANCIENNE RECOMMANDATION
    const existing = document.getElementById('weatherRecommendation');
    if (existing) existing.remove();
    
    let recommendation = '', className = '';
    
    switch(mode) {
        case 'auto':
            if (!selectedDay) return;
            const type = getWeatherType(selectedDay.description);
            const modeText = type === 'sunny' ? 'Beau Temps' : type === 'rainy' ? 'Pluvieux' : 'Mixte';
            recommendation = `<i class="fas fa-robot"></i> ${selectedDay.description} → Mode ${modeText} activé`;
            className = type;
            break;
        case 'sunny':
            recommendation = '<i class="fas fa-sun"></i> Parfait pour Île de Ré, vélo et photos !';
            className = 'sunny';
            break;
        case 'rainy':
            recommendation = '<i class="fas fa-umbrella"></i> Idéal pour musées, aquarium et thalasso !';
            className = 'rainy';
            break;
        case 'mixed':
            recommendation = '<i class="fas fa-cloud-sun"></i> Flexible ! Activités indoor et outdoor prêtes.';
            className = 'mixed';
            break;
    }
    
    if (recommendation) {
        const recDiv = document.createElement('div');
        recDiv.id = 'weatherRecommendation';
        recDiv.className = `weather-recommendation ${className}`;
        recDiv.innerHTML = recommendation;
        recDiv.style.opacity = '0';
        recDiv.style.transform = 'translateY(-10px)';
        recDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) {
            weatherWidget.appendChild(recDiv);
            
            // ✅ ANIMATION FLUIDE
            requestAnimationFrame(() => {
                recDiv.style.opacity = '1';
                recDiv.style.transform = 'translateY(0)';
            });
        }
    }
}

// ✅ NOTIFICATIONS OPTIMISÉES
function showNotification(message) {
    const existingNotification = document.querySelector('.toast-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary-color);
        color: var(--secondary-color);
        padding: 10px 18px;
        border-radius: 8px;
        z-index: 3000;
        opacity: 0;
        transition: all 0.3s ease;
        transform: translateY(-20px);
        max-width: 280px;
        font-size: 0.85rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500); // Durée réduite à 2.5s
}