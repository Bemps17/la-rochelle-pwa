// Message de débogage pour confirmer le chargement du script
console.log('🚀 Script app.js chargé avec succès');
console.log('📄 URL du script:', import.meta.url);
console.log('🏷️ Type de module:', typeof import.meta);

// ===================================================================================
//  IMPORTATIONS DES MODULES
// ===================================================================================
import { renderWeatherWidget, setWeatherMode, fetchWeatherData } from './weather.js';
import { loadState, saveState } from './storage.js';
import { showSuccess, showError, showInfo } from './notifications.js';
import { renderHeader } from '../components/header.js';

// ===================================================================================
//  DÉFINITION DES DONNÉES STATIQUES (Version mise à jour par l'utilisateur)
// ===================================================================================
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
    }
    // ... (les autres jours du planning devraient être ajoutés ici)
];

const fallbackWeatherData = {
    data: [
        { date: "2025-08-06", day_of_week: "mercredi", description: "Plutôt nuageux", temperature_max_celsius: 27, temperature_min_celsius: 17, icon: "03d" },
        { date: "2025-08-07", day_of_week: "jeudi", description: "Ensoleillé", temperature_max_celsius: 28, temperature_min_celsius: 18, icon: "01d" },
        { date: "2025-08-08", day_of_week: "vendredi", description: "Averses éparses", temperature_max_celsius: 25, temperature_min_celsius: 19, icon: "09d" }
    ]
};

// ===================================================================================
//  GESTION DE L'ÉTAT DE L'APPLICATION (STATE MANAGEMENT)
// ===================================================================================
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
        if (!error.message.includes('données de test') && !error.message.includes('audio')) {
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


// ===================================================================================
//  SONS & NOTIFICATIONS
// ===================================================================================
let audioContext = null;
let soundsEnabled = false;

const createSoftSound = (frequency, duration = 0.1, volume = 0.05) => {
    if (!soundsEnabled || !audioContext) return;
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Son non disponible:', error.message);
    }
};

const initAudio = async () => {
    try {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            soundsEnabled = true;
        }
    } catch (error) {
        console.warn('Audio non disponible:', error.message);
        soundsEnabled = false;
    }
};

window.clickSound = () => createSoftSound(800, 0.05, 0.03);
window.successSound = () => createSoftSound(1000, 0.1, 0.05);
window.menuSound = () => createSoftSound(600, 0.08, 0.04);

// ===================================================================================
//  LOGIQUE PWA (PROGRESSIVE WEB APP)
// ===================================================================================
let deferredPrompt;

const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            // D'abord, désenregistrer tous les anciens service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
                console.log('🗑️ Ancien Service Worker désenregistré:', registration.scope);
            }

            // Enregistrer le nouveau service worker avec le bon scope
            // Note: Le scope est maintenant défini sur '/src/' pour correspondre à la structure du projet
            const registration = await navigator.serviceWorker.register('/sw.js', { 
                scope: '/',
                // Utiliser l'en-tête Service-Worker-Allowed pour autoriser le scope racine
                // Cela nécessite une configuration côté serveur
                updateViaCache: 'none' // Toujours récupérer la dernière version
            });
            
            console.log('✅ Nouveau Service Worker enregistré avec succès');
            console.log('🔹 Scope:', registration.scope);
            console.log('🔹 État:', registration.active ? 'Actif' : 'En attente d\'activation');

            // Vérifier les mises à jour
            if (registration.installing) {
                console.log('🔹 Service Worker en cours d\'installation');
                registration.installing.addEventListener('statechange', event => {
                    console.log(`🔹 État du Service Worker: ${event.target.state}`);
                });
            }

            // Écouter les mises à jour
            registration.addEventListener('updatefound', () => {
                console.log('🔄 Nouvelle version du Service Worker détectée');
                showNotification('🔄 Mise à jour disponible ! La page va se recharger.');
                // Recharger la page après un court délai pour appliquer la mise à jour
                setTimeout(() => window.location.reload(), 2000);
            });

            // Vérifier les mises à jour régulièrement
            setInterval(() => {
                registration.update().catch(err => 
                    console.log('🔍 Vérification des mises à jour échouée:', err)
                );
            }, 60 * 60 * 1000); // Toutes les heures

        } catch (error) {
            console.error('❌ Échec de l\'enregistrement du Service Worker:', error);
            // Essayer avec un scope plus restreint en cas d'échec
            try {
                console.log('🔄 Tentative avec un scope plus restreint...');
                const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/src/' });
                console.log('✅ Service Worker enregistré avec scope /src/');
            } catch (nestedError) {
                console.error('❌ Échec de la deuxième tentative d\'enregistrement:', nestedError);
            }
        }
    } else {
        console.warn('⚠️ Service Worker non supporté par ce navigateur');
    }
};

const setupPWAInstall = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    window.addEventListener('appinstalled', () => {
        showNotification('🎉 App installée avec succès !');
        hideInstallButton();
    });
};

const showInstallButton = () => {
    const installBtn = document.createElement('li');
    installBtn.innerHTML = `<a href="#" id="installPwaBtn"><i class="fas fa-download"></i> Installer l'App</a>`;
    installBtn.id = 'installBtn';
    const menuList = document.querySelector('.menu-list');
    if (menuList && !document.getElementById('installBtn')) {
        menuList.appendChild(installBtn);
    }
};

const hideInstallButton = () => {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.remove();
};

window.installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        showNotification('🎉 Installation en cours...');
    }
    deferredPrompt = null;
    hideInstallButton();
};

// ===================================================================================
//  FONCTIONS DE RENDU PRINCIPALES
// ===================================================================================

async function renderPage() {
    console.log('🔍 Début de renderPage()');
    const page = window.appState.state.currentPage;
    
    // Ajout de logs pour chaque élément du DOM
    const mainContent = document.getElementById('main-content');
    const homePage = document.getElementById('home-page');
    const planningPage = document.getElementById('planning-page');
    const photosPage = document.getElementById('photos-page');

    console.log('Éléments du DOM:', { mainContent, homePage, planningPage, photosPage });

    if (!mainContent || !homePage || !planningPage || !photosPage) {
        console.error('❌ Éléments de page principaux introuvables');
        console.log('Contenu de document.body:', document.body ? document.body.innerHTML.substring(0, 500) + '...' : 'document.body est null');
        return;
    }

    // Masquer toutes les pages
    homePage.style.display = 'none';
    planningPage.style.display = 'none';
    photosPage.style.display = 'none';

    // Afficher la page active
    if (page === 'home') {
        homePage.style.display = 'block';
        await renderApp();
    } else if (page === 'planning') {
        planningPage.style.display = 'block';
        renderDays();
    } else if (page === 'photos') {
        photosPage.style.display = 'block';
        // renderPhotoPage();
    }

    renderMenu();
}

async function renderApp() {
    // Set theme
    document.documentElement.setAttribute('data-theme', window.appState.state.theme);
    
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Render components
    renderDays();
    updateProgress();
    
    // Only render weather widget if the container exists
    const weatherContainer = document.getElementById('weatherForecast');
    if (weatherContainer) {
        renderWeatherWidget();
        fetchWeatherData().catch(error => {
            console.warn('Erreur lors du chargement des données météo:', error);
            console.log('Utilisation des données météo de test');
        });
    } else {
        console.warn('Conteneur météo non trouvé, report du rendu des prévisions');
        // Try again after a short delay in case the container is added dynamically
        setTimeout(() => {
            if (document.getElementById('weatherForecast')) {
                renderWeatherWidget();
                fetchWeatherData().catch(console.error);
            }
        }, 1000);
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
            `<h3 class="archived-title">Jours Archivés</h3>` + archivedDays.map(day => renderDayCard(day)).join('') : '';
    }
    
    updateWeatherVisibility();
}

function renderDayCard(day) {
    const isArchived = window.appState.state.completedDays.includes(day.day);
    return `
        <div class="day-card ${isArchived ? 'archived' : ''}" id="day-card-${day.day}">
            <div class="day-header" data-day-id="${day.day}">
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
                        <h4><i class="fas fa-comments"></i> Mes Notes</h4>
                        <div class="comment-form" data-day-id="${day.day}">
                            <input type="text" class="comment-input" placeholder="Ajouter une note...">
                            <button type="submit" class="comment-btn"><i class="fas fa-plus"></i> Ajouter</button>
                        </div>
                        <div class="comments-list" id="comments${day.day}">${renderComments(day.day)}</div>
                    </div>
                    <div class="day-actions">
                        <button class="action-btn ${isArchived ? 'unarchive-btn' : 'archive-btn'}" data-day-id="${day.day}">
                            <i class="fas fa-${isArchived ? 'box-open' : 'check'}"></i> ${isArchived ? 'Désarchiver' : 'Terminer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderComments(dayNumber) {
    const dayComments = window.appState.state.comments['day' + dayNumber] || [];
    return dayComments.map(c => `<div class="comment"><p class="comment-text">${c.text}</p></div>`).join('');
}

function renderMenu() {
    const menuPanel = document.querySelector('.menu-panel');
    if (!menuPanel) return;
    
    menuPanel.innerHTML = `
        <div class="menu-header">
            <h2>Menu</h2>
            <button class="close-menu" onclick="toggleMenu()">&times;</button>
        </div>
        <nav class="menu-nav">
            <a href="#" onclick="navigate('home')" class="${window.appState.state.currentPage === 'home' ? 'active' : ''}">
                <i class="fas fa-home"></i> Accueil
            </a>
            <a href="#" onclick="navigate('planning')" class="${window.appState.state.currentPage === 'planning' ? 'active' : ''}">
                <i class="fas fa-calendar-alt"></i> Planning
            </a>
            <a href="#" onclick="navigate('photos')" class="${window.appState.state.currentPage === 'photos' ? 'active' : ''}">
                <i class="fas fa-camera"></i> Photos
            </a>
        </nav>
    `;
}


// ===================================================================================
//  LOGIQUE D'INTERACTION
// ===================================================================================

function toggleMenu() {
    window.appState.state.menuOpen = !window.appState.state.menuOpen;
    const menuPanel = document.querySelector('.menu-panel');
    const menuOverlay = document.querySelector('.menu-overlay');
    if (menuPanel && menuOverlay) {
        menuPanel.classList.toggle('open', window.appState.state.menuOpen);
        menuOverlay.classList.toggle('open', window.appState.state.menuOpen);
    }
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

function toggleArchiveDay(dayNumber) {
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

function addComment(dayNumber, text) {
    if (!text) return;
    const dayKey = 'day' + dayNumber;
    if (!window.appState.state.comments[dayKey]) {
        window.appState.state.comments[dayKey] = [];
    }
    window.appState.state.comments[dayKey].push({ text, date: new Date().toISOString() });
    saveState();
    document.getElementById(`comments${dayNumber}`).innerHTML = renderComments(dayNumber);
    showSuccess('✅ Note ajoutée !');
    window.successSound();
}

/**
 * Met à jour la barre de progression et les statistiques du voyage
 * Gère les cas d'erreur et fournit des retours visuels
 */
function updateProgress() {
    try {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            console.warn('Élément de la barre de progression non trouvé');
            return;
        }
        
        const totalDays = tripData?.length || 0;
        if (totalDays === 0) {
            console.warn('Aucune donnée de voyage disponible');
            return;
        }
        
        const completedDays = window.appState?.state?.completedDays?.length || 0;
        const progress = Math.min(100, Math.max(0, Math.round((completedDays / totalDays) * 100)));
        
        // Animation fluide de la barre de progression
        progressBar.style.transition = 'width 0.5s ease-in-out';
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        
        // Mise à jour du texte de progression avec formatage
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            const daysText = completedDays <= 1 ? 'jour' : 'jours';
            progressText.textContent = `${completedDays} ${daysText} sur ${totalDays} (${progress}%)`;
            progressText.setAttribute('aria-label', `Progression: ${progress}%`);
        }
        
        // Changement de couleur en fonction de la progression
        if (progress < 25) {
            progressBar.style.backgroundColor = '#e63946'; // Rouge
        } else if (progress < 75) {
            progressBar.style.backgroundColor = '#ffbe0b'; // Orange
        } else {
            progressBar.style.backgroundColor = '#2a9d8f'; // Vert
        }
        
        console.log(`📊 Progression mise à jour: ${completedDays}/${totalDays} jours (${progress}%)`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error);
        window.appState.handleError(error, 'updateProgress');
    }
}

function updateWeatherVisibility() {
    const mode = window.appState.state.weatherMode;
    document.querySelectorAll('.weather-section').forEach(section => {
        if (section.classList.contains('sunny-weather')) {
            section.style.display = (mode === 'sunny' || mode === 'mixed') ? 'block' : 'none';
        } else if (section.classList.contains('rainy-weather')) {
            section.style.display = (mode === 'rainy' || mode === 'mixed') ? 'block' : 'none';
        }
    });
}

function showModal(modalId) {
    // Fermer toute modale ouverte
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    // Créer l'overlay de la modale
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <div class="modal-body" id="modal-${modalId}"></div>
        </div>
    `;

    // Ajouter la modale au DOM
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';

    // Remplir le contenu de la modale en fonction de l'ID
    const modalBody = document.getElementById(`modal-${modalId}`);
    
    switch(modalId) {
        case 'stats':
            const completedDays = window.appState.state.completedDays.length;
            const totalDays = tripData.length;
            const progress = Math.round((completedDays / totalDays) * 100);
            
            modalBody.innerHTML = `
                <h2>Statistiques du séjour</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${completedDays}/${totalDays}</div>
                        <div class="stat-label">Jours complétés</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${progress}%</div>
                        <div class="stat-label">Progression</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Object.keys(window.appState.state.comments).length}</div>
                        <div class="stat-label">Notes</div>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            `;
            break;
            
        case 'about':
            modalBody.innerHTML = `
                <h2>À propos</h2>
                <p>Application de suivi de voyage à La Rochelle.</p>
                <p>Version 1.0.0</p>
                <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
            `;
            break;
            
        default:
            modalBody.innerHTML = '<p>Contenu de la modale non disponible.</p>';
    }

    // Gérer la fermeture de la modale
    const closeButton = modalOverlay.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        document.body.style.overflow = '';
        modalOverlay.remove();
    });

    // Fermer en cliquant en dehors du contenu
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.style.overflow = '';
            modalOverlay.remove();
        }
    });

    // Fermer avec la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.style.overflow = '';
            modalOverlay.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function exportToPDF() {
    showNotification('⚠️ Fonction d\'export PDF en cours de développement.');
}

function toggleTheme() {
    window.appState.state.theme = window.appState.state.theme === 'dark' ? 'light' : 'dark';
    saveState();
    document.documentElement.setAttribute('data-theme', window.appState.state.theme);
    renderMenu();
    window.successSound();
    showNotification(`🎨 Mode ${window.appState.state.theme === 'dark' ? 'sombre' : 'clair'} activé !`);
}


// ===================================================================================
//  GESTIONNAIRES D'ÉVÉNEMENTS
// ===================================================================================

function setupEventListeners() {
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        const dayHeader = target.closest('.day-header');
        const archiveBtn = target.closest('.action-btn.archive-btn, .action-btn.unarchive-btn');
        const goHomeBtn = target.closest('#goHomeBtn');

        if (dayHeader) {
            toggleDayCard(dayHeader.dataset.dayId);
        } else if (archiveBtn) {
            toggleArchiveDay(parseInt(archiveBtn.dataset.dayId));
        } else if (goHomeBtn) {
            navigate('home');
        }
    });

    document.body.addEventListener('submit', (e) => {
        if (e.target.classList.contains('comment-form')) {
            e.preventDefault();
            const form = e.target;
            const input = form.querySelector('.comment-input');
            const dayId = form.dataset.dayId;
            if (input.value.trim()) {
                addComment(dayId, input.value.trim());
                input.value = '';
            }
        }
    });
}

// ===================================================================================
//  INITIALISATION DE L'APPLICATION
// ===================================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // On rend les composants principaux comme l'en-tête
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        renderHeader(headerContainer, { 
            onMenuClick: toggleMenu, 
            onMenuSound: menuSound 
        });
    }
    console.log('🚀 Initialisation de La Rochelle PWA');
    
    // Vérifier si le DOM est bien chargé
    console.log('📄 Contenu de document.body:', document.body ? 'document.body existe' : 'document.body est null');
    
    await registerServiceWorker();
    setupPWAInstall();
    document.body.addEventListener('click', initAudio, { once: true });
    
    // Vérifier l'état initial
    console.log('🔍 État initial de appState:', JSON.stringify(window.appState.state, null, 2));
    
    loadState();
    
    // Vérifier l'état après le chargement
    console.log('🔄 État après loadState():', JSON.stringify(window.appState.state, null, 2));
    
    setupEventListeners();
    
    // Vérifier les éléments du DOM avant renderPage()
    console.log('🔍 Vérification des éléments DOM avant renderPage()');
    console.log('main-content:', document.getElementById('main-content'));
    console.log('home-page:', document.getElementById('home-page'));
    console.log('planning-page:', document.getElementById('planning-page'));
    console.log('photos-page:', document.getElementById('photos-page'));
    
    await renderPage();
    console.log('✅ La Rochelle PWA initialisée avec succès');
});
