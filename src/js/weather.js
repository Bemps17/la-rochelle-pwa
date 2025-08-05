import { saveState } from './storage.js';

const API_KEY = 'YOUR_VALID_API_KEY_HERE'; // Remplace par une clé valide
const LA_ROCHELLE_LAT = 46.1603;
const LA_ROCHELLE_LON = -1.1493;

export async function fetchWeatherData() {
    const refreshButton = document.getElementById('refreshWeatherBtn');
    if (!refreshButton) return;
    refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    refreshButton.disabled = true;
    showNotification('🔄 Récupération des données météo...');
    try {
        if (!window.appState.state.isOnline) throw new Error('Mode hors-ligne actif');
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${LA_ROCHELLE_LAT}&lon=${LA_ROCHELLE_LON}&cnt=10&units=metric&lang=fr&appid=${API_KEY}`);
        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
        const data = await response.json();
        window.weatherData = {
            data: data.list.map((day, index) => ({
                date: new Date(day.dt * 1000).toISOString().split('T')[0],
                day_of_week: new Date(day.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long' }),
                description: day.weather[0].description,
                temperature_max_celsius: Math.round(day.temp.max),
                temperature_min_celsius: Math.round(day.temp.min),
                icon: day.weather[0].icon
            }))
        };
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        renderWeatherWidget();
        setWeatherMode(window.appState.state.weatherMode);
        showNotification('✅ Données météo actualisées !');
        window.successSound();
    } catch (error) {
        window.appState.handleError(error, 'fetchWeatherData');
        window.weatherData = window.fallbackWeatherData;
        renderWeatherWidget();
        showNotification('⚠️ Utilisation des données météo de secours');
    } finally {
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshButton.disabled = false;
    }
}

export function renderWeatherWidget() {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel || !window.weatherData || !window.weatherData.data) {
        console.warn('Widget météo ou données introuvables');
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    carousel.innerHTML = window.weatherData.data.map((day, index) => {
        const isToday = day.date === today;
        const type = getWeatherType(day.description);
        return `
            <div class="weather-forecast-card ${index === window.appState.state.selectedDayIndex ? 'selected' : ''} ${isToday ? 'today' : ''}" onclick="selectDayWeather(${index}, '${type}')">
                <div class="day">${isToday ? 'Aujourd\'hui' : day.day_of_week.substring(0,3)}.</div>
                <div class="icon"><img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}"></div>
                <div class="temps">${day.temperature_max_celsius}° / ${day.temperature_min_celsius}°</div>
                <div class="description">${day.description}</div>
            </div>`;
    }).join('');
    document.querySelectorAll('.weather-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(window.appState.state.weatherMode + 'Btn')?.classList.add('active');
    const cardWidth = 100;
    const visibleCards = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
    window.carouselPosition = Math.max(0, Math.min(window.appState.state.selectedDayIndex - Math.floor(visibleCards / 2), window.weatherData.data.length - visibleCards));
    carousel.style.transform = `translateX(-${window.carouselPosition * cardWidth}px)`;
}

export function setWeatherMode(mode) {
    if (!window.weatherData || !window.weatherData.data || !window.weatherData.data[window.appState.state.selectedDayIndex]) {
        console.warn('Données météo non disponibles pour setWeatherMode');
        return;
    }
    window.appState.state.weatherMode = mode === 'auto' ? getWeatherType(window.weatherData.data[window.appState.state.selectedDayIndex].description) : mode;
    saveState();
    updateWeatherVisibility();
    renderWeatherWidget();
    showWeatherRecommendation(window.appState.state.weatherMode);
}

function getWeatherType(description) {
    if (!description) return 'mixed';
    const desc = description.toLowerCase();
    if (desc.includes('pluie') || desc.includes('averse') || desc.includes('orage')) return 'rainy';
    if (desc.includes('nuageux') || desc.includes('couvert')) return 'mixed';
    return 'sunny';
}

function updateWeatherVisibility() {
    document.querySelectorAll('.sunny-weather').forEach(el => el.style.display = (window.appState.state.weatherMode === 'sunny' || window.appState.state.weatherMode === 'mixed') ? 'block' : 'none');
    document.querySelectorAll('.rainy-weather').forEach(el => el.style.display = (window.appState.state.weatherMode === 'rainy' || window.appState.state.weatherMode === 'mixed') ? 'block' : 'none');
}

function showWeatherRecommendation(mode) {
    const existing = document.getElementById('weatherRecommendation');
    if (existing) existing.remove();
    let recommendation = '', className = '';
    switch(mode) {
        case 'auto':
            if (!window.weatherData.data[window.appState.state.selectedDayIndex]) return;
            const today = window.weatherData.data[window.appState.state.selectedDayIndex];
            const type = getWeatherType(today.description);
            recommendation = `<i class="fas fa-robot"></i> Aujourd'hui : ${today.description} → Mode ${type === 'sunny' ? 'Beau Temps' : type === 'rainy' ? 'Pluvieux' : 'Mixte'} activé`;
            className = type;
            break;
        case 'sunny':
            recommendation = '<i class="fas fa-sun"></i> Parfait pour Île de Ré, paddle et photos !';
            className = 'sunny';
            break;
        case 'rainy':
            recommendation = '<i class="fas fa-umbrella"></i> Idéal pour musées et thalasso !';
            className = 'rainy';
            break;
        case 'mixed':
            recommendation = '<i class="fas fa-cloud-sun"></i> Flexible ! Préparez les deux options.';
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
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) weatherWidget.appendChild(recDiv);
        setTimeout(() => {
            recDiv.style.opacity = '1';
            recDiv.style.transform = 'translateY(0)';
        }, 100);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = 'var(--primary-color)';
    notification.style.color = 'var(--secondary-color)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '3000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    notification.style.transform = 'translateY(-20px)';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}