import { renderHeader } from '../components/header.js';
import { renderWeatherWidget, setWeatherMode, fetchWeatherData } from './weather.js';
import { loadState, saveState } from './storage.js';
import { renderChecklist } from '../components/checklist.js';

// Données des Jours
const tripData = [
    {
        day: 1, title: "Démarrage en Douceur", subtitle: "Le Port comme Toile de Fond", budget: "5€",
        sunnyActivities: ["Balade photo au Vieux-Port", "Tour Saint-Nicolas et Tour de la Chaîne", "Café terrasse Cours des Dames", "Session photo contraste pierre/voiliers"],
        rainyActivities: ["Exploration passages couverts centre-ville", "Photos architecture sous les arcades", "Café Book Hémisphères (librairie-café)", "Visite Office de Tourisme"],
        links: [
            { name: "Office de Tourisme La Rochelle", url: "https://www.larochelle-tourisme.com", icon: "fas fa-info-circle" },
            { name: "Vieux-Port", url: "https://www.larochelle-tourisme.com/decouvrir/port-de-plaisance", icon: "fas fa-anchor" },
            { name: "Tours de La Rochelle", url: "https://www.tours-la-rochelle.fr", icon: "fas fa-landmark" }
        ]
    },
    // Ajoute d'autres jours si nécessaire
];

// Données Météo Fallback
const fallbackWeatherData = {
    data: [
        { date: "2025-08-05", day_of_week: "mardi", description: "Principalement ensoleillé", temperature_max_celsius: 26, temperature_min_celsius: 16, icon: "01d" },
        { date: "2025-08-06", day_of_week: "mercredi", description: "Plutôt nuageux", temperature_max_celsius: 27, temperature_min_celsius: 17, icon: "03d" },
        { date: "2025-08-07", day_of_week: "jeudi", description: "Ensoleillé", temperature_max_celsius: 28, temperature_min_celsius: 18, icon: "01d" },
        { date: "2025-08-08", day_of_week: "vendredi", description: "Averses éparses", temperature_max_celsius: 25, temperature_min_celsius: 19, icon: "09d" },
        { date: "2025-08-09", day_of_week: "samedi", description: "Ensoleillé", temperature_max_celsius: 28, temperature_min_celsius: 20, icon: "01d" },
        { date: "2025-08-10", day_of_week: "dimanche", description: "Ensoleillé", temperature_max_celsius: 27, temperature_min_celsius: 19, icon: "01d" },
        { date: "2025-08-11", day_of_week: "lundi", description: "Ensoleillé", temperature_max_celsius: 29, temperature_min_celsius: 20, icon: "01d" },
        { date: "2025-08-12", day_of_week: "mardi", description: "Ensoleillé", temperature_max_celsius: 28, temperature_min_celsius: 19, icon: "01d" },
        { date: "2025-08-13", day_of_week: "mercredi", description: "Partiellement nuageux", temperature_max_celsius: 28, temperature_min_celsius: 20, icon: "02d" },
        { date: "2025-08-14", day_of_week: "jeudi", description: "Partiellement nuageux", temperature_max_celsius: 27, temperature_min_celsius: 19, icon: "02d" }
    ]
};

window.weatherData = fallbackWeatherData;

// État Global
class AppState {
    constructor() {
        this.state = {
            theme: 'light',
            menuOpen: false,
            weatherMode: 'auto',
            selectedDayIndex: 0,
            completedDays: [],
            comments: {},
            photoChecklist: {},
            uploadedPhotos: {},
            currentPage: 'home',
            isOnline: navigator.onLine,
            errors: []
        };
        this.listeners = new Set();
    }

    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.state.errors.push({ message: error.message, context, timestamp: new Date() });
        this.notify();
        showNotification(`⚠️ Erreur: ${error.message}`);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

window.appState = new AppState();

// Clé API Météo
const API_KEY = 'YOUR_VALID_API_KEY_HERE'; // Remplace par une clé valide depuis https://openweathermap.org/api

// Coordonnées de La Rochelle
const LA_ROCHELLE_LAT = 46.1603;
const LA_ROCHELLE_LON = -1.1493;

// Initialisation de Tone.js
let toneStarted = false;
const initTone = async () => {
    try {
        await Tone.start();
        toneStarted = true;
        console.log('Tone.js AudioContext démarré avec succès');
    } catch (error) {
        console.error('Erreur lors du démarrage de Tone.js:', error);
        window.appState.handleError(error, 'initTone');
    }
};

const synth = new Tone.Synth().toDestination();
window.clickSound = () => {
    if (toneStarted) synth.triggerAttackRelease('C4', '8n');
};
window.successSound = () => {
    if (toneStarted) synth.triggerAttackRelease('G4', '8n');
};
window.menuSound = () => {
    if (toneStarted) synth.triggerAttackRelease('E4', '8n');
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation de l\'application');
    document.body.addEventListener('click', async () => {
        if (!toneStarted) await initTone();
    }, { once: true });
    loadState();
    setupEventListeners();
    renderPage('home');
});

async function renderPage() {
    const app = document.getElementById('app');
    const page = appState.currentPage || 'home';
    try {
        const response = await fetch(`src/pages/${page}.html`);
        if (!response.ok) throw new Error(`Page ${page}.html not found`);
        app.innerHTML = await response.text();
        renderHeader(document.getElementById('header'));
        if (page === 'home') {
            renderApp();
            fetchWeatherData();
            setWeatherMode('auto');
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        app.innerHTML = '<p>Erreur : Impossible de charger la page.</p>';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, lancement de renderPage');
    renderPage();
    // ...
});

function setupEventListeners() {
    document.addEventListener('click', e => {
        if (e.target.id === 'menu-toggle-btn') { toggleMenu(); window.menuSound(); }
        if (e.target.closest('.menu-overlay')) { toggleMenu(); window.menuSound(); }
        if (e.target.id === 'refreshWeatherBtn') { fetchWeatherData(); window.clickSound(); }
        if (e.target.classList.contains('modal')) { e.target.style.display = 'none'; }
        if (e.target.id === 'nav-home') { navigate('home'); window.menuSound(); }
        if (e.target.id === 'nav-planning') { navigate('planning'); window.menuSound(); }
        if (e.target.id === 'nav-photos') { navigate('photos'); window.menuSound(); }
        if (e.target.id === 'nav-about') { navigate('about'); window.menuSound(); }
    });
    document.addEventListener('keypress', e => {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
            const dayNumber = e.target.id.replace('commentInput', '');
            addComment(parseInt(dayNumber));
        }
    });
    document.addEventListener('change', e => {
        if (e.target.type === 'checkbox' && e.target.id.startsWith('photo-')) {
            window.appState.state.photoChecklist[e.target.id] = e.target.checked;
            saveState();
            updatePhotoProgress();
            if (e.target.checked) {
                showNotification(`📸 Photo "${e.target.nextSibling.textContent.trim()}" cochée !`);
                window.successSound();
            }
        } else if (e.target.type === 'file' && e.target.id.startsWith('photo-upload-')) {
            handlePhotoUpload(e);
        }
    });
    setupSwipeToClose();
    setupCarouselSwipe();
}

function navigate(page) {
    window.appState.state.currentPage = page;
    saveState();
    toggleMenu();
    renderPage(page);
}

function setupCarouselSwipe() {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) return;
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) { scrollCarousel(1); window.clickSound(); }
        if (touchEndX - touchStartX > 50) { scrollCarousel(-1); window.clickSound(); }
    }, { passive: true });
}

function renderApp() {
    document.documentElement.setAttribute('data-theme', window.appState.state.theme);
    renderWeatherWidget();
    renderDays();
    renderMenu();
    updateProgress();
}

let carouselPosition = 0;

function scrollCarousel(direction) {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) return;
    const cards = carousel.querySelectorAll('.weather-forecast-card');
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + 10;
    const visibleCards = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
    const maxPosition = cards.length - visibleCards;

    carouselPosition = Math.min(Math.max(carouselPosition + direction, 0), maxPosition);
    carousel.style.transform = `translateX(-${carouselPosition * cardWidth}px)`;

    if (window.appState.state.selectedDayIndex < carouselPosition || window.appState.state.selectedDayIndex >= carouselPosition + visibleCards) {
        window.appState.state.selectedDayIndex = Math.max(carouselPosition, Math.min(window.appState.state.selectedDayIndex, carouselPosition + visibleCards - 1));
        setWeatherMode(window.appState.state.weatherMode);
    }
}

function renderDays() {
    const daysList = document.getElementById('daysList');
    const archivedDaysContainer = document.getElementById('archivedDaysContainer');
    if (!daysList || !archivedDaysContainer) return;
    const activeDays = tripData.filter(d => !window.appState.state.completedDays.includes(d.day));
    const archivedDays = tripData.filter(d => window.appState.state.completedDays.includes(d.day));
    daysList.innerHTML = activeDays.map(day => renderDayCard(day)).join('');
    archivedDaysContainer.innerHTML = archivedDays.length > 0 ?
        `<h3 style="color: var(--text-light); margin: 15px 0 8px;">Jours Archivés</h3>` + archivedDays.map(day => renderDayCard(day)).join('') : '';
    updateWeatherVisibility();
}

function renderDayCard(day) {
    const isArchived = window.appState.state.completedDays.includes(day.day);
    return `
        <div class="day-card ${isArchived ? 'archived' : ''}" id="day-card-${day.day}">
            <div class="day-header" onclick="toggleDayCard(${day.day})">
                <div>
                    <h2>Jour ${day.day}: ${day.title}</h2>
                    <small>${day.subtitle}</small>
                </div>
                <div class="budget-badge"><i class="fas fa-euro-sign"></i> ${day.budget}</div>
                <i class="fas fa-chevron-right day-toggle-icon"></i>
            </div>
            <div class="day-content-collapsible">
                <div class="day-content-inner">
                    <div class="weather-sections">
                        <div class="weather-section sunny-weather">
                            <h3><i class="fas fa-sun"></i> Beau Temps</h3>
                            <ul class="activity-list">${day.sunnyActivities.map(a => `<li><i class="fas fa-check-circle"></i> ${a}</li>`).join('')}</ul>
                        </div>
                        <div class="weather-section rainy-weather">
                            <h3><i class="fas fa-cloud-rain"></i> Pluie</h3>
                            <ul class="activity-list">${day.rainyActivities.map(a => `<li><i class="fas fa-check-circle"></i> ${a}</li>`).join('')}</ul>
                        </div>
                    </div>
                    <div class="links-section">
                        <h4><i class="fas fa-external-link-alt"></i> Liens Utiles</h4>
                        <div class="links-grid">${day.links.map(l => `<a href="${l.url}" target="_blank" class="external-link"><i class="${l.icon}"></i> ${l.name}</a>`).join('')}</div>
                    </div>
                    <div class="comments-section">
                        <div class="comments-header">
                            <h4><i class="fas fa-comments"></i> Mes Notes</h4>
                            <span style="color: var(--text-light); font-size: 0.8rem;">${(window.appState.state.comments['day' + day.day] || []).length} commentaire(s)</span>
                        </div>
                        <div class="comment-form">
                            <input type="text" class="comment-input" placeholder="Ajouter une note..." id="commentInput${day.day}">
                            <button class="comment-btn" onclick="addComment(${day.day})"><i class="fas fa-plus"></i> Ajouter</button>
                        </div>
                        <div id="comments${day.day}">${renderComments(day.day)}</div>
                    </div>
                    <div class="day-actions">
                        <button class="action-btn ${isArchived ? 'unarchive-btn' : 'archive-btn'}" onclick="toggleArchiveDay(${day.day}, event)">
                            <i class="fas fa-${isArchived ? 'box-open' : 'check'}"></i> ${isArchived ? 'Désarchiver' : 'Terminer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderComments(dayNumber) {
    const dayComments = window.appState.state.comments['day' + dayNumber] || [];
    return dayComments.map(c => `
        <div class="comment">
            <div class="comment-meta"><span class="comment-author">Moi</span><span>${c.date}</span></div>
            <div class="comment-text">${c.text}</div>
        </div>`).join('');
}

function addComment(dayNumber) {
    const input = document.getElementById(`commentInput${dayNumber}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    if (!window.appState.state.comments['day' + dayNumber]) window.appState.state.comments['day' + dayNumber] = [];
    window.appState.state.comments['day' + dayNumber].push({
        text,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
    saveState();
    input.value = '';
    document.getElementById(`comments${dayNumber}`).innerHTML = renderComments(dayNumber);
    document.querySelector(`#comments${dayNumber}`).closest('.comments-section').querySelector('.comments-header span').textContent = `${window.appState.state.comments['day' + dayNumber].length} commentaire(s)`;
    showNotification('✅ Note ajoutée !');
    window.successSound();
}

function renderMenu() {
    const menuPanel = document.querySelector('.menu-panel');
    if (!menuPanel) {
        console.warn('Menu panel non trouvé, menu non rendu');
        return;
    }
    menuPanel.innerHTML = `
        <h3>Navigation</h3>
        <ul class="menu-list">
            <li><a href="#" id="nav-home"><i class="fas fa-home"></i> Accueil</a></li>
            <li><a href="#" id="nav-planning"><i class="fas fa-calendar"></i> Planning</a></li>
            <li><a href="#" id="nav-photos"><i class="fas fa-camera"></i> Photos</a></li>
            <li><a href="#" id="nav-about"><i class="fas fa-info-circle"></i> À propos</a></li>
        </ul>
        <h3>Outils</h3>
        <ul class="menu-list">
            <li><a href="#" onclick="showModal('statsModal')"><i class="fas fa-chart-pie"></i> Statistiques</a></li>
            <li><a href="#" onclick="showModal('photoModal')"><i class="fas fa-camera"></i> Checklist Photos</a></li>
            <li><a href="#" onclick="exportToPDF()"><i class="fas fa-file-pdf"></i> Exporter en PDF</a></li>
            <li><a href="#" onclick="toggleTheme()"><i class="fas fa-adjust"></i> ${window.appState.state.theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</a></li>
        </ul>`;
}

function toggleTheme() {
    window.appState.state.theme = window.appState.state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    renderApp();
    window.successSound();
}

function toggleMenu() {
    window.appState.state.menuOpen = !window.appState.state.menuOpen;
    const menuPanel = document.querySelector('.menu-panel');
    const menuOverlay = document.querySelector('.menu-overlay');
    if (menuPanel && menuOverlay) {
        menuPanel.classList.toggle('open', window.appState.state.menuOpen);
        menuOverlay.classList.toggle('open', window.appState.state.menuOpen);
    }
}

function setupSwipeToClose() {
    const menu = document.querySelector('.menu-panel');
    if (!menu) {
        console.log('Menu panel non trouvé, swipe non initialisé');
        return;
    }
    let touchstartX = 0;
    menu.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });
    menu.addEventListener('touchend', e => {
        if (e.changedTouches[0].screenX > touchstartX + 50) {
            toggleMenu();
            window.menuSound();
        }
    }, { passive: true });
}

function toggleDayCard(dayNumber) {
    const card = document.getElementById(`day-card-${dayNumber}`);
    if (!card) return;
    const content = card.querySelector('.day-content-collapsible');
    if (card.classList.toggle('open')) content.style.maxHeight = content.scrollHeight + 'px';
    else content.style.maxHeight = null;
}

function toggleArchiveDay(dayNumber, event) {
    event.stopPropagation();
    const index = window.appState.state.completedDays.indexOf(dayNumber);
    if (index > -1) {
        window.appState.state.completedDays.splice(index, 1);
        showNotification(`🎉 Jour ${dayNumber} désarchivé !`);
    } else {
        window.appState.state.completedDays.push(dayNumber);
        showNotification(`🎉 Jour ${dayNumber} terminé !`);
    }
    saveState();
    renderDays();
    updateProgress();
    window.successSound();
}

function updateProgress() {
    const totalDays = tripData.length;
    const completedCount = window.appState.state.completedDays.length;
    const percentage = Math.round((completedCount / totalDays) * 100);
    const progressCircle = document.getElementById('progressCircle');
    const progressText = document.getElementById('progressText');
    if (progressCircle && progressText) {
        progressCircle.textContent = percentage + '%';
        progressCircle.style.setProperty('--progress-angle', `${percentage * 3.6}deg`);
        progressText.textContent = `${completedCount}/${totalDays} jours planifiés`;
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showNotification('⚠️ Veuillez sélectionner une image.');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        const photoId = event.target.id.replace('photo-upload-', '');
        window.appState.state.uploadedPhotos[photoId] = reader.result;
        saveState();
        const preview = document.getElementById(`photo-preview-${photoId}`);
        if (preview) {
            preview.src = reader.result;
            preview.style.display = 'block';
        }
        showNotification(`📷 Photo pour "${event.target.closest('label').textContent.trim()}" chargée !`);
        window.successSound();
    };
    reader.onerror = () => showNotification('⚠️ Erreur lors du chargement de la photo.');
    reader.readAsDataURL(file);
}

function updatePhotoProgress() {
    const totalPhotos = 16;
    const completedPhotos = Object.values(window.appState.state.photoChecklist).filter(Boolean).length;
    const percentage = Math.round((completedPhotos / totalPhotos) * 100);
    const photoProgress = document.getElementById('photoProgress');
    if (photoProgress) {
        photoProgress.textContent = `${completedPhotos}/${totalPhotos} photos prises (${percentage}%)`;
    }
}

function showModal(id) {
    let title = '', content = '';
    switch(id) {
        case 'statsModal':
            title = 'Statistiques du Voyage';
            const totalBudget = tripData.reduce((sum, day) => sum + parseFloat(day.budget.replace('€', '').replace(',', '.')), 0);
            const totalComments = Object.values(window.appState.state.comments).reduce((sum, c) => sum + c.length, 0);
            const totalPhotos = Object.values(window.appState.state.photoChecklist).filter(Boolean).length;
            content = `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="background: var(--secondary-color); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 8px;"><i class="fas fa-calendar-check"></i></div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${window.appState.state.completedDays.length}/10</div>
                        <div>Jours complétés</div>
                    </div>
                    <div style="background: var(--secondary-color); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 8px;"><i class="fas fa-comments"></i></div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${totalComments}</div>
                        <div>Notes ajoutées</div>
                    </div>
                    <div style="background: var(--secondary-color); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 8px;"><i class="fas fa-camera"></i></div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${totalPhotos}/16</div>
                        <div>Photos capturées</div>
                    </div>
                    <div style="background: var(--secondary-color); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; color: var(--primary-color); margin-bottom: 8px;"><i class="fas fa-euro-sign"></i></div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${totalBudget.toFixed(0)}€</div>
                        <div>Budget total</div>
                    </div>
                </div>`;
            break;
        case 'photoModal':
            title = 'Checklist Photos';
            content = `
                <div style="margin-bottom: 15px;">
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🏛️ La Rochelle Historique</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-tours"> Les trois Tours emblématiques
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-tours').click()">Charger</button>
                                <input type="file" id="photo-upload-tours" accept="image/*" style="display: none;">
                                <img id="photo-preview-tours" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-arcades"> Rues à arcades (Rue des Merciers)
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-arcades').click()">Charger</button>
                                <input type="file" id="photo-upload-arcades" accept="image/*" style="display: none;">
                                <img id="photo-preview-arcades" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-horloge"> Grosse Horloge
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-horloge').click()">Charger</button>
                                <input type="file" id="photo-upload-horloge" accept="image/*" style="display: none;">
                                <img id="photo-preview-horloge" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-hoteldeville"> Détails Hôtel de Ville
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-hoteldeville').click()">Charger</button>
                                <input type="file" id="photo-upload-hoteldeville" accept="image/*" style="display: none;">
                                <img id="photo-preview-hoteldeville" class="photo-preview">
                            </div>
                        </label>
                    </div>
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🌊 Maritime & Littoral</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-sunset"> Couchers soleil depuis remparts
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-sunset').click()">Charger</button>
                                <input type="file" id="photo-upload-sunset" accept="image/*" style="display: none;">
                                <img id="photo-preview-sunset" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-phare"> Phare du Bout du Monde
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-phare').click()">Charger</button>
                                <input type="file" id="photo-upload-phare" accept="image/*" style="display: none;">
                                <img id="photo-preview-phare" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-minimes"> Port des Minimes
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-minimes').click()">Charger</button>
                                <input type="file" id="photo-upload-minimes" accept="image/*" style="display: none;">
                                <img id="photo-preview-minimes" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-reflets"> Reflets sable mouillé Châtelaillon
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-reflets').click()">Charger</button>
                                <input type="file" id="photo-upload-reflets" accept="image/*" style="display: none;">
                                <img id="photo-preview-reflets" class="photo-preview">
                            </div>
                        </label>
                    </div>
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🏝️ Île de Ré</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-baleines"> Phare des Baleines crépuscule
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-baleines').click()">Charger</button>
                                <input type="file" id="photo-upload-baleines" accept="image/*" style="display: none;">
                                <img id="photo-preview-baleines" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-conche"> Plage de la Conche
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-conche').click()">Charger</button>
                                <input type="file" id="photo-upload-conche" accept="image/*" style="display: none;">
                                <img id="photo-preview-conche" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-marais"> Marais salants géométriques
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-marais').click()">Charger</button>
                                <input type="file" id="photo-upload-marais" accept="image/*" style="display: none;">
                                <img id="photo-preview-marais" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-saintmartin"> Port Saint-Martin-de-Ré
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-saintmartin').click()">Charger</button>
                                <input type="file" id="photo-upload-saintmartin" accept="image/*" style="display: none;">
                                <img id="photo-preview-saintmartin" class="photo-preview">
                            </div>
                        </label>
                    </div>
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">⚓ Rochefort & Nature</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-corderie"> Corderie Royale monumentale
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-corderie').click()">Charger</button>
                                <input type="file" id="photo-upload-corderie" accept="image/*" style="display: none;">
                                <img id="photo-preview-corderie" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-radoub"> Formes de radoub historiques
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-radoub').click()">Charger</button>
                                <input type="file" id="photo-upload-radoub" accept="image/*" style="display: none;">
                                <img id="photo-preview-radoub" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-charruyer"> Canaux Parc Charruyer
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-charruyer').click()">Charger</button>
                                <input type="file" id="photo-upload-charruyer" accept="image/*" style="display: none;">
                                <img id="photo-preview-charruyer" class="photo-preview">
                            </div>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-fortboyard"> Fort Boyard depuis la mer
                            <div class="photo-upload-container">
                                <button class="photo-upload-btn" onclick="document.getElementById('photo-upload-fortboyard').click()">Charger</button>
                                <input type="file" id="photo-upload-fortboyard" accept="image/*" style="display: none;">
                                <img id="photo-preview-fortboyard" class="photo-preview">
                            </div>
                        </label>
                    </div>
                </div>
                <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; text-align: center;">
                    <div id="photoProgress">0/16 photos prises (0%)</div>
                </div>`;
            break;
    }
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.style.display='none'">&times;</button>
            </div>
            ${content}
        </div>`;
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modal);
        modal.style.display = 'block';
    }
    Object.keys(window.appState.state.photoChecklist).forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = window.appState.state.photoChecklist[id];
    });
    Object.keys(window.appState.state.uploadedPhotos).forEach(id => {
        const preview = document.getElementById(`photo-preview-${id}`);
        if (preview && window.appState.state.uploadedPhotos[id]) {
            preview.src = window.appState.state.uploadedPhotos[id];
            preview.style.display = 'block';
        }
    });
    updatePhotoProgress();
}

function exportToPDF() {
    showNotification('⚠️ Fonction d’export PDF non implémentée.');
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

window.addEventListener('online', () => {
    window.appState.state.isOnline = true;
    showNotification('🌐 Connexion rétablie');
    fetchWeatherData();
});

window.addEventListener('offline', () => {
    window.appState.state.isOnline = false;
    showNotification('📴 Mode hors-ligne actif');
});