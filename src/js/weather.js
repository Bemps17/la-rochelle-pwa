import { saveState } from './storage.js';

const API_KEY = 'YOUR_VALID_API_KEY_HERE'; // Remplace par une clé valide
const LA_ROCHELLE_LAT = 46.1603;
const LA_ROCHELLE_LON = -1.1493;

export async function fetchWeatherData() {
    const refreshButton = document.getElementById('refreshWeatherBtn');
    if (refreshButton) {
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        refreshButton.disabled = true;
    }
    
    showNotification('🔄 Récupération des données météo...');
    
    try {
        if (!window.appState.state.isOnline) {
            throw new Error('Mode hors-ligne actif');
        }
        
        // Utiliser les données de fallback pour éviter les erreurs API
        if (API_KEY === 'YOUR_VALID_API_KEY_HERE') {
            throw new Error('Clé API non configurée - utilisation des données de test');
        }
        
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${LA_ROCHELLE_LAT}&lon=${LA_ROCHELLE_LON}&cnt=40&units=metric&lang=fr&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Traiter les données pour avoir une prévision par jour
        const dailyData = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    date,
                    day_of_week: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long' }),
                    description: item.weather[0].description,
                    temperature_max_celsius: Math.round(item.main.temp_max),
                    temperature_min_celsius: Math.round(item.main.temp_min),
                    icon: item.weather[0].icon
                };
            } else {
                // Mettre à jour les températures min/max
                dailyData[date].temperature_max_celsius = Math.max(
                    dailyData[date].temperature_max_celsius, 
                    Math.round(item.main.temp_max)
                );
                dailyData[date].temperature_min_celsius = Math.min(
                    dailyData[date].temperature_min_celsius, 
                    Math.round(item.main.temp_min)
                );
            }
        });
        
        window.weatherData = {
            data: Object.values(dailyData).slice(0, 10) // Garder seulement 10 jours
        };
        
        updateLastUpdateTime();
        renderWeatherWidget();
        setWeatherMode(window.appState.state.weatherMode);
        showNotification('✅ Données météo actualisées !');
        if (window.successSound) window.successSound();
        
    } catch (error) {
        console.warn('Erreur météo:', error.message);
        if (window.appState && window.appState.handleError) {
            window.appState.handleError(error, 'fetchWeatherData');
        }
        
        // Utiliser les données de fallback
        window.weatherData = window.fallbackWeatherData;
        updateLastUpdateTime();
        renderWeatherWidget();
        showNotification('⚠️ Utilisation des données météo de test');
        
    } finally {
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshButton.disabled = false;
        }
    }
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
        carousel.innerHTML = '<p>Données météo non disponibles</p>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Ajouter les flèches du carrousel
    carousel.innerHTML = window.weatherData.data.map((day, index) => {
        const isToday = day.date === today;
        const type = getWeatherType(day.description);
        const isSelected = index === window.appState.state.selectedDayIndex;
        
        return `
            <div class="weather-forecast-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                 onclick="selectDayWeather(${index}, '${type}')">
                <div class="day">${isToday ? 'Aujourd\'hui' : day.day_of_week.substring(0,3)}.</div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${day.icon}.png" 
                         alt="${day.description}" 
                         onerror="this.style.display='none'">
                </div>
                <div class="temps">${day.temperature_max_celsius}° / ${day.temperature_min_celsius}°</div>
                <div class="description">${day.description}</div>
            </div>`;
    }).join('');
    
    // Ajouter les flèches du carrousel
    const carouselContainer = carousel.parentElement;
    if (carouselContainer && !carouselContainer.querySelector('.carousel-arrow')) {
        carouselContainer.style.position = 'relative';
        carouselContainer.insertAdjacentHTML('beforeend', `
            <button class="carousel-arrow left" onclick="scrollCarousel(-1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-arrow right" onclick="scrollCarousel(1)">
                <i class="fas fa-chevron-right"></i>
            </button>
        `);
    }
    
    // Mettre à jour les boutons météo
    document.querySelectorAll('.weather-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(window.appState.state.weatherMode + 'Btn');
    if (activeBtn) activeBtn.classList.add('active');
    
    // Ajuster la position du carrousel
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) return;
    
    const cardWidth = 100; // largeur approximative d'une carte + gap
    const visibleCards = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
    const maxData = window.weatherData ? window.weatherData.data.length : 0;
    
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

// Fonction globale pour la sélection de jour
window.selectDayWeather = function(index, type) {
    window.appState.state.selectedDayIndex = index;
    setWeatherMode('auto');
    if (window.clickSound) window.clickSound();
};

function getWeatherType(description) {
    if (!description) return 'mixed';
    const desc = description.toLowerCase();
    if (desc.includes('pluie') || desc.includes('averse') || desc.includes('orage')) return 'rainy';
    if (desc.includes('nuageux') || desc.includes('couvert')) return 'mixed';
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
    // Supprimer l'ancienne recommandation
    const existing = document.getElementById('weatherRecommendation');
    if (existing) existing.remove();
    
    let recommendation = '', className = '';
    
    switch(mode) {
        case 'auto':
            if (!selectedDay) return;
            const type = getWeatherType(selectedDay.description);
            recommendation = `<i class="fas fa-robot"></i> Aujourd'hui : ${selectedDay.description} → Mode ${type === 'sunny' ? 'Beau Temps' : type === 'rainy' ? 'Pluvieux' : 'Mixte'} activé`;
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
        recDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const weatherWidget = document.querySelector('.weather-widget');
        if (weatherWidget) {
            weatherWidget.appendChild(recDiv);
            
            setTimeout(() => {
                recDiv.style.opacity = '1';
                recDiv.style.transform = 'translateY(0)';
            }, 100);
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: var(--secondary-color);
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        transform: translateY(-20px);
        max-width: 300px;
        word-wrap: break-word;
    `;
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