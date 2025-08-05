import { renderHeader } from '../components/header.js';
import { renderWeatherWidget, setWeatherMode, fetchWeatherData } from './weather.js';
import { loadState, saveState } from './storage.js';
import { renderChecklist } from '../components/checklist.js';

// Données complètes des 10 jours de voyage à La Rochelle
const tripData = [
    {
        day: 1, 
        title: "Démarrage en Douceur", 
        subtitle: "Le Port comme Toile de Fond", 
        budget: "5€",
        sunnyActivities: [
            "Balade photo au Vieux-Port", 
            "Tour Saint-Nicolas et Tour de la Chaîne", 
            "Café terrasse Cours des Dames", 
            "Session photo contraste pierre/voiliers"
        ],
        rainyActivities: [
            "Exploration passages couverts centre-ville", 
            "Photos architecture sous les arcades", 
            "Café Book Hémisphères (librairie-café)", 
            "Visite Office de Tourisme"
        ],
        links: [
            { name: "Office de Tourisme La Rochelle", url: "https://www.larochelle-tourisme.com", icon: "fas fa-info-circle" },
            { name: "Vieux-Port", url: "https://www.larochelle-tourisme.com/decouvrir/port-de-plaisance", icon: "fas fa-anchor" },
            { name: "Tours de La Rochelle", url: "https://www.tours-la-rochelle.fr", icon: "fas fa-landmark" }
        ]
    },
    {
        day: 2, 
        title: "Île de Ré", 
        subtitle: "Vélo et Plages", 
        budget: "25€",
        sunnyActivities: [
            "Location vélo sur l'île", 
            "Plage de la Conche des Baleines", 
            "Phare des Baleines au coucher du soleil", 
            "Balade dans les marais salants"
        ],
        rainyActivities: [
            "Musée Ernest Cognacq", 
            "Ateliers artisanaux Saint-Martin", 
            "Dégustation huîtres et fleur de sel", 
            "Fort La Prée et son histoire"
        ],
        links: [
            { name: "Île de Ré Tourisme", url: "https://www.iledere.com", icon: "fas fa-bicycle" },
            { name: "Phare des Baleines", url: "https://www.pharedesbaleines.fr", icon: "fas fa-lighthouse" },
            { name: "Location vélos", url: "https://www.cycling-location.com", icon: "fas fa-bicycle" }
        ]
    },
    {
        day: 3, 
        title: "Rochefort Maritime", 
        subtitle: "Histoire Navale", 
        budget: "18€",
        sunnyActivities: [
            "Corderie Royale et jardins", 
            "Forme de radoub et vaisseaux", 
            "Balade en Charente", 
            "Photos panoramiques depuis les ponts"
        ],
        rainyActivities: [
            "Musée National de la Marine", 
            "Visite intérieure de l'Hermione", 
            "Centre International de la Mer", 
            "Ateliers de construction navale"
        ],
        links: [
            { name: "Rochefort Océan", url: "https://www.rochefort-ocean.com", icon: "fas fa-ship" },
            { name: "Corderie Royale", url: "https://www.corderie-royale.com", icon: "fas fa-industry" },
            { name: "L'Hermione", url: "https://www.hermione.com", icon: "fas fa-sailboat" }
        ]
    },
    {
        day: 4, 
        title: "Fort Boyard & Oléron", 
        subtitle: "Îles et Fortifications", 
        budget: "35€",
        sunnyActivities: [
            "Excursion bateau vers Fort Boyard", 
            "Plage de Boyardville", 
            "Tour de l'île d'Oléron à vélo", 
            "Phare de Chassiron"
        ],
        rainyActivities: [
            "Maison des Paludiers", 
            "Musée de l'Île d'Oléron", 
            "Dégustation d'huîtres Marennes-Oléron", 
            "Citadelle du Château d'Oléron"
        ],
        links: [
            { name: "Île d'Oléron Tourisme", url: "https://www.ile-oleron-marennes.com", icon: "fas fa-island-tropical" },
            { name: "Excursions Fort Boyard", url: "https://www.croisiere-fortboyard.com", icon: "fas fa-ferry" },
            { name: "Phare de Chassiron", url: "https://www.phare-chassiron.fr", icon: "fas fa-lighthouse" }
        ]
    },
    {
        day: 5, 
        title: "Marais Poitevin", 
        subtitle: "Venise Verte", 
        budget: "22€",
        sunnyActivities: [
            "Balade en barque dans les conches", 
            "Vélo le long des canaux", 
            "Observation oiseaux migrateurs", 
            "Pique-nique au bord de l'eau"
        ],
        rainyActivities: [
            "Maison du Marais Poitevin", 
            "Abbaye de Maillezais", 
            "Musée des Métiers traditionnels", 
            "Dégustation produits locaux (mojettes, anguilles)"
        ],
        links: [
            { name: "Marais Poitevin", url: "https://www.parc-marais-poitevin.fr", icon: "fas fa-water" },
            { name: "Barques du Marais", url: "https://www.barques-marais-poitevin.com", icon: "fas fa-ship" },
            { name: "Abbaye de Maillezais", url: "https://www.abbaye-maillezais.fr", icon: "fas fa-church" }
        ]
    },
    {
        day: 6, 
        title: "Cognac & Vignobles", 
        subtitle: "Patrimoine et Saveurs", 
        budget: "45€",
        sunnyActivities: [
            "Visite distillerie Hennessy", 
            "Balade dans les vignes", 
            "Croisière sur la Charente", 
            "Photos château de Cognac"
        ],
        rainyActivities: [
            "Musée des Arts du Cognac", 
            "Caves et dégustation Martell", 
            "Visite de la vieille ville", 
            "Ateliers de tonnellerie"
        ],
        links: [
            { name: "Tourisme Cognac", url: "https://www.tourism-cognac.com", icon: "fas fa-wine-bottle" },
            { name: "Hennessy", url: "https://www.hennessy.com/fr/visites", icon: "fas fa-industry" },
            { name: "Château de Cognac", url: "https://www.chateau-cognac.com", icon: "fas fa-castle" }
        ]
    },
    {
        day: 7, 
        title: "Saintes Antique", 
        subtitle: "Vestiges Gallo-Romains", 
        budget: "15€",
        sunnyActivities: [
            "Amphithéâtre gallo-romain", 
            "Arc de Germanicus", 
            "Balade sur les berges de Charente", 
            "Jardin archéologique"
        ],
        rainyActivities: [
            "Musée Archéologique", 
            "Abbaye aux Dames", 
            "Crypte Saint-Eutrope (UNESCO)", 
            "Musée Dupuy-Mestreau"
        ],
        links: [
            { name: "Saintes Tourisme", url: "https://www.saintes-tourisme.fr", icon: "fas fa-monument" },
            { name: "Amphithéâtre", url: "https://www.saintes.fr/amphitheatre", icon: "fas fa-theater-masks" },
            { name: "Abbaye aux Dames", url: "https://www.abbayeauxdames.org", icon: "fas fa-church" }
        ]
    },
    {
        day: 8, 
        title: "Royan & Côte de Beauté", 
        subtitle: "Architecture Balnéaire", 
        budget: "20€",
        sunnyActivities: [
            "Grande plage de Royan", 
            "Architecture années 50", 
            "Phare de Cordouan (excursion)", 
            "Front de mer et casino"
        ],
        rainyActivities: [
            "Église Notre-Dame de Royan", 
            "Musée de Royan", 
            "Marché couvert central", 
            "Spa et thalassothérapie"
        ],
        links: [
            { name: "Royan Tourisme", url: "https://www.royan-tourisme.com", icon: "fas fa-umbrella-beach" },
            { name: "Phare de Cordouan", url: "https://www.phare-cordouan.fr", icon: "fas fa-lighthouse" },
            { name: "Architecture Royan", url: "https://www.royan-architecture.fr", icon: "fas fa-building" }
        ]
    },
    {
        day: 9, 
        title: "Retour à La Rochelle", 
        subtitle: "Aquarium et Détente", 
        budget: "28€",
        sunnyActivities: [
            "Aquarium de La Rochelle", 
            "Port des Minimes et bateaux", 
            "Parc Charruyer en vélo", 
            "Coucher soleil depuis les remparts"
        ],
        rainyActivities: [
            "Musée Maritime", 
            "Musée du Nouveau Monde", 
            "Shopping rues piétonnes", 
            "Hammam et spa urbain"
        ],
        links: [
            { name: "Aquarium La Rochelle", url: "https://www.aquarium-larochelle.com", icon: "fas fa-fish" },
            { name: "Musée Maritime", url: "https://www.musee-maritime-larochelle.fr", icon: "fas fa-anchor" },
            { name: "Port des Minimes", url: "https://www.port-plaisance-larochelle.fr", icon: "fas fa-sailboat" }
        ]
    },
    {
        day: 10, 
        title: "Dernières Découvertes", 
        subtitle: "Shopping et Souvenirs", 
        budget: "30€",
        sunnyActivities: [
            "Marché de La Rochelle", 
            "Dernière balade sur le port", 
            "Photos souvenir aux Tours", 
            "Terrasse pour un dernier verre"
        ],
        rainyActivities: [
            "Galeries marchandes couvertes", 
            "Derniers achats de souvenirs", 
            "Café littéraire Book Hémisphères", 
            "Préparation du départ"
        ],
        links: [
            { name: "Marché La Rochelle", url: "https://www.larochelle.fr/marches", icon: "fas fa-shopping-basket" },
            { name: "Halles Centrales", url: "https://www.halles-larochelle.fr", icon: "fas fa-store" },
            { name: "Artisanat Local", url: "https://www.boutiques-larochelle.fr", icon: "fas fa-gift" }
        ]
    }
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
        console.warn(`Warning in ${context}:`, error.message);
        this.state.errors.push({ message: error.message, context, timestamp: new Date() });
        this.notify();
        // Ne pas afficher de notification pour les erreurs mineures
        if (!error.message.includes('données de test') && !error.message.includes('Tone.js')) {
            showNotification(`⚠️ ${error.message}`);
        }
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Variables globales
window.appState = new AppState();
window.weatherData = fallbackWeatherData;
window.fallbackWeatherData = fallbackWeatherData;
window.tripData = tripData;
let carouselPosition = 0;

// Clé API Météo (remplacer par une vraie clé)
const API_KEY = 'd0ed757b80035226f3a2eb7adb68f3a5';

// Gestion améliorée des sons - BEAUCOUP PLUS SILENCIEUX
let audioContext = null;
let toneStarted = false;
let soundsEnabled = false;

// Sons plus doux avec oscillateurs simples
const createSoftSound = (frequency, duration = 0.1, volume = 0.1) => {
    if (!soundsEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine'; // Son plus doux
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Son non disponible:', error.message);
    }
};

// Initialisation audio plus sûre
const initAudio = async () => {
    try {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            soundsEnabled = true;
            console.log('Audio contexte initialisé');
        }
    } catch (error) {
        console.warn('Audio non disponible:', error.message);
        soundsEnabled = false;
    }
};

// Sons très discrets
window.clickSound = () => createSoftSound(800, 0.05, 0.05);
window.successSound = () => createSoftSound(1000, 0.1, 0.08);
window.menuSound = () => createSoftSound(600, 0.08, 0.06);

// Fonctions globales nécessaires
window.toggleMenu = toggleMenu;
window.setWeatherMode = setWeatherMode;
window.selectDayWeather = selectDayWeather;
window.scrollCarousel = scrollCarousel;
window.toggleDayCard = toggleDayCard;
window.toggleArchiveDay = toggleArchiveDay;
window.addComment = addComment;
window.showModal = showModal;
window.exportToPDF = exportToPDF;
window.toggleTheme = toggleTheme;
window.navigate = navigate;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation de l\'application');
    
    // Initialiser l'audio au premier clic utilisateur
    document.body.addEventListener('click', async () => {
        if (!soundsEnabled) {
            await initAudio();
        }
    }, { once: true });
    
    loadState();
    setupEventListeners();
    renderPage();
});

async function renderPage() {
    const app = document.getElementById('app');
    const header = document.getElementById('header');
    const page = window.appState.state.currentPage || 'home';
    
    try {
        const response = await fetch(`src/pages/${page}.html`);
        if (!response.ok) throw new Error(`Page ${page}.html not found`);
        app.innerHTML = await response.text();
        
        // Rendu du header
        if (header) {
            renderHeader(header);
        }
        
        // Actions spécifiques selon la page
        if (page === 'home') {
            await renderApp();
        } else if (page === 'photos') {
            renderChecklist();
        }
        
        // Toujours rendre le menu et assurer sa visibilité
        renderMenu();
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        app.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2>Oups !</h2>
                <p>Impossible de charger la page "${page}".</p>
                <button onclick="navigate('home')" style="padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Retour à l'accueil
                </button>
            </div>`;
        if (header) renderHeader(header);
        renderMenu();
    }
}

function setupEventListeners() {
    document.addEventListener('click', handleClick);
    document.addEventListener('keypress', handleKeypress);
    document.addEventListener('change', handleChange);
    
    // Configuration des swipes après un délai
    setTimeout(() => {
        setupSwipeToClose();
        setupCarouselSwipe();
    }, 1000);
}

function handleClick(e) {
    // Gestion améliorée du menu hamburger
    if (e.target.closest('#menu-toggle-btn') || e.target.closest('.fa-bars')) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
        window.menuSound();
        return;
    }
    
    // Fermer menu en cliquant sur overlay
    if (e.target.classList.contains('menu-overlay')) {
        toggleMenu();
        window.menuSound();
        return;
    }
    
    // Boutons météo
    if (e.target.id === 'refreshWeatherBtn' || e.target.closest('#refreshWeatherBtn')) {
        fetchWeatherData();
        window.clickSound();
        return;
    }
    
    if (e.target.id === 'sunnyBtn') { setWeatherMode('sunny'); window.clickSound(); return; }
    if (e.target.id === 'rainyBtn') { setWeatherMode('rainy'); window.clickSound(); return; }
    if (e.target.id === 'mixedBtn') { setWeatherMode('mixed'); window.clickSound(); return; }
    if (e.target.id === 'autoBtn') { setWeatherMode('auto'); window.clickSound(); return; }
    
    // Navigation
    if (e.target.id === 'nav-home') { navigate('home'); return; }
    if (e.target.id === 'nav-planning') { navigate('planning'); return; }
    if (e.target.id === 'nav-photos') { navigate('photos'); return; }
    if (e.target.id === 'nav-about') { navigate('about'); return; }
    
    // Fermer modales
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal') || e.target;
        if (modal) modal.style.display = 'none';
        return;
    }
    
    // Flèches carrousel
    if (e.target.classList.contains('carousel-arrow') || e.target.closest('.carousel-arrow')) {
        const arrow = e.target.closest('.carousel-arrow') || e.target;
        const direction = arrow.classList.contains('left') ? -1 : 1;
        scrollCarousel(direction);
        window.clickSound();
        return;
    }
}

function handleKeypress(e) {
    if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
        const dayNumber = e.target.id.replace('commentInput', '');
        addComment(parseInt(dayNumber));
    }
}

function handleChange(e) {
    if (e.target.type === 'checkbox' && e.target.id.startsWith('photo-')) {
        window.appState.state.photoChecklist[e.target.id] = e.target.checked;
        saveState();
        if (window.updatePhotoProgress) window.updatePhotoProgress();
        if (e.target.checked) {
            showNotification(`📸 Photo cochée !`);
            window.successSound();
        }
    } else if (e.target.type === 'file' && e.target.id.startsWith('photo-upload-')) {
        handlePhotoUpload(e);
    }
}

function navigate(page) {
    window.appState.state.currentPage = page;
    saveState();
    if (window.appState.state.menuOpen) {
        toggleMenu();
    }
    renderPage();
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

async function renderApp() {
    document.documentElement.setAttribute('data-theme', window.appState.state.theme);
    
    // Attendre un peu pour que le DOM soit prêt
    await new Promise(resolve => setTimeout(resolve, 100));
    
    renderWeatherWidget();
    renderDays();
    updateProgress();
    
    // Initialiser les données météo de façon silencieuse
    try {
        await fetchWeatherData();
        setWeatherMode('auto');
    } catch (error) {
        // Ignore les erreurs météo - les données fallback sont utilisées
        console.log('Utilisation des données météo de test');
    }
}

function selectDayWeather(index, type) {
    window.appState.state.selectedDayIndex = index;
    setWeatherMode('auto');
    window.clickSound();
}

function scrollCarousel(direction) {
    const carousel = document.getElementById('weatherForecast');
    if (!carousel) return;
    
    const cards = carousel.querySelectorAll('.weather-forecast-card');
    if (!cards.length) return;
    
    const cardWidth = cards[0].offsetWidth + 12; // Incluent le gap
    const visibleCards = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
    const maxPosition = Math.max(0, cards.length - visibleCards);

    carouselPosition = Math.min(Math.max(carouselPosition + direction, 0), maxPosition);
    carousel.style.transform = `translateX(-${carouselPosition * cardWidth}px)`;

    // Mettre à jour la sélection si nécessaire
    if (window.appState.state.selectedDayIndex < carouselPosition || 
        window.appState.state.selectedDayIndex >= carouselPosition + visibleCards) {
        window.appState.state.selectedDayIndex = Math.max(carouselPosition, 
            Math.min(window.appState.state.selectedDayIndex, carouselPosition + visibleCards - 1));
        setWeatherMode(window.appState.state.weatherMode);
    }
}

function renderDays() {
    const daysList = document.getElementById('daysList');
    const archivedDaysContainer = document.getElementById('archivedDaysContainer');
    
    if (!daysList) return;
    
    const activeDays = tripData.filter(d => !window.appState.state.completedDays.includes(d.day));
    const archivedDays = tripData.filter(d => window.appState.state.completedDays.includes(d.day));
    
    daysList.innerHTML = activeDays.map(day => renderDayCard(day)).join('');
    
    if (archivedDaysContainer) {
        archivedDaysContainer.innerHTML = archivedDays.length > 0 ?
            `<h3 style="color: var(--text-light); margin: 15px 0 8px;">Jours Archivés</h3>` + 
            archivedDays.map(day => renderDayCard(day)).join('') : '';
    }
    
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
    
    if (!window.appState.state.comments['day' + dayNumber]) {
        window.appState.state.comments['day' + dayNumber] = [];
    }
    
    window.appState.state.comments['day' + dayNumber].push({
        text,
        date: new Date().toLocaleDateString('fr-FR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        })
    });
    
    saveState();
    input.value = '';
    
    const commentsContainer = document.getElementById(`comments${dayNumber}`);
    if (commentsContainer) {
        commentsContainer.innerHTML = renderComments(dayNumber);
    }
    
    const commentsHeader = document.querySelector(`#comments${dayNumber}`).closest('.comments-section').querySelector('.comments-header span');
    if (commentsHeader) {
        commentsHeader.textContent = `${window.appState.state.comments['day' + dayNumber].length} commentaire(s)`;
    }
    
    showNotification('✅ Note ajoutée !');
    window.successSound();
}

function renderMenu() {
    // Créer le menu s'il n'existe pas
    if (!document.querySelector('.menu-panel')) {
        const menuHTML = `
            <div class="menu-overlay"></div>
            <div class="menu-panel">
                <!-- Contenu du menu sera ajouté par JS -->
            </div>
            <div id="modalContainer"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    const menuPanel = document.querySelector('.menu-panel');
    if (!menuPanel) return;
    
    menuPanel.innerHTML = `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-light); margin-bottom: 20px;">
            <h2 style="color: var(--primary-color); font-size: 1.2rem;">La Rochelle PWA</h2>
        </div>
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
        </ul>
        <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-light); text-align: center;">
            <p style="color: var(--text-light); font-size: 0.8rem;">Version 1.0.0</p>
        </div>`;
}

function toggleTheme() {
    window.appState.state.theme = window.appState.state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    document.documentElement.setAttribute('data-theme', window.appState.state.theme);
    renderMenu(); // Re-render pour mettre à jour le texte du bouton
    window.successSound();
    showNotification(`🎨 Mode ${window.appState.state.theme === 'dark' ? 'sombre' : 'clair'} activé !`);
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
    if (!menu) return;
    
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
    if (card.classList.toggle('open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = null;
    }
    window.clickSound();
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

function updateWeatherVisibility() {
    const mode = window.appState.state.weatherMode;
    document.querySelectorAll('.sunny-weather').forEach(el => {
        el.style.display = (mode === 'sunny' || mode === 'mixed') ? 'block' : 'none';
    });
    document.querySelectorAll('.rainy-weather').forEach(el => {
        el.style.display = (mode === 'rainy' || mode === 'mixed') ? 'block' : 'none';
    });
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
        
        showNotification(`📷 Photo chargée !`);
        window.successSound();
    };
    
    reader.onerror = () => showNotification('⚠️ Erreur lors du chargement de la photo.');
    reader.readAsDataURL(file);
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
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${window.appState.state.completedDays.length}/${tripData.length}</div>
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
                <div style="max-height: 60vh; overflow-y: auto;">
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🏛️ La Rochelle Historique</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-tours"> Les trois Tours emblématiques
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-arcades"> Rues à arcades (Rue des Merciers)
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-horloge"> Grosse Horloge
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-hoteldeville"> Détails Hôtel de Ville
                        </label>
                    </div>
                    
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🌊 Maritime & Littoral</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-sunset"> Couchers soleil depuis remparts
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-phare"> Phare du Bout du Monde
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-minimes"> Port des Minimes
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-reflets"> Reflets sable mouillé Châtelaillon
                        </label>
                    </div>
                    
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">🏝️ Île de Ré</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-baleines"> Phare des Baleines crépuscule
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-conche"> Plage de la Conche
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-marais"> Marais salants géométriques
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-saintmartin"> Port Saint-Martin-de-Ré
                        </label>
                    </div>
                    
                    <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 8px;">⚓ Rochefort & Nature</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-corderie"> Corderie Royale monumentale
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-radoub"> Formes de radoub historiques
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <input type="checkbox" id="photo-charruyer"> Canaux Parc Charruyer
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="photo-fortboyard"> Fort Boyard depuis la mer
                        </label>
                    </div>
                </div>
                <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; text-align: center; margin-top: 15px;">
                    <div id="photoProgress">0/16 photos prises (0%)</div>
                </div>`;
            break;
    }
    
    // Créer ou récupérer le container de modales
    let modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        document.body.appendChild(modalContainer);
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
    
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    modal.style.display = 'block';
    
    // Restaurer l'état des checkboxes si c'est la modale photo
    if (id === 'photoModal') {
        Object.keys(window.appState.state.photoChecklist).forEach(photoId => {
            const checkbox = document.getElementById(photoId);
            if (checkbox) checkbox.checked = window.appState.state.photoChecklist[photoId];
        });
        
        // Mettre à jour le progrès
        const totalPhotos = 16;
        const completedPhotos = Object.values(window.appState.state.photoChecklist).filter(Boolean).length;
        const percentage = Math.round((completedPhotos / totalPhotos) * 100);
        const photoProgress = document.getElementById('photoProgress');
        if (photoProgress) {
            photoProgress.textContent = `${completedPhotos}/${totalPhotos} photos prises (${percentage}%)`;
        }
    }
}

function exportToPDF() {
    showNotification('⚠️ Fonction d\'export PDF en cours de développement.');
}

function showNotification(message) {
    // Éviter les notifications en double
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
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 3000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        transform: translateY(-20px) translateX(20px);
        max-width: 300px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 0.9rem;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0) translateX(0)';
    });
    
    // Animation de sortie
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px) translateX(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event listeners pour les changements de connexion
window.addEventListener('online', () => {
    window.appState.state.isOnline = true;
    showNotification('🌐 Connexion rétablie');
    // Essayer de récupérer les vraies données météo
    if (API_KEY !== 'YOUR_VALID_API_KEY_HERE') {
        fetchWeatherData();
    }
});

window.addEventListener('offline', () => {
    window.appState.state.isOnline = false;
    showNotification('📴 Mode hors-ligne actif');
});