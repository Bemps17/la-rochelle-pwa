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
    window.appState.state.weatherMode = mode === 'auto' ? getWeatherType(window.weatherData.data[window.appState.state.selectedDayIndex].description) : mode;
    saveState();
    updateWeatherVisibility();
    renderWeatherWidget();
    showWeatherRecommendation(window.appState.state.weatherMode);
}

function getWeatherType(description) {
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
        document.querySelector('.weather-widget').appendChild(recDiv);
        setTimeout(() => {
            recDiv.style.opacity = '1';
            recDiv.style.transform = 'translateY(0)';
        }, 100);
    }
}