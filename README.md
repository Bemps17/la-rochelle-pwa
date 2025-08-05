# La Rochelle PWA

Une Progressive Web App pour planifier vos vacances à La Rochelle, avec météo, activités par jour, checklist photos, et mode hors-ligne.

## Fonctionnalités
- **Météo dynamique** : Prévisions sur 10 jours avec recommandations selon la météo.
- **Planification par jour** : Activités adaptées au temps (soleil/pluie), budget, et liens utiles.
- **Checklist photos** : Suivez vos captures des lieux emblématiques.
- **Dark Mode** : Interface avec contraste amélioré pour une meilleure lisibilité.
- **Sons interactifs** : Effets sonores avec Tone.js pour les interactions.
- **PWA** : Installation sur mobile/desktop, mode hors-ligne.

## Structure du projet
la-rochelle-pwa
├── src
│   ├── js
│   │   ├── app.js           // Logique principale
│   │   ├── weather.js       // Service météo
│   │   ├── storage.js       // Gestion du stockage local
│   │   └── sw.js           // Service Worker
│   ├── css
│   │   ├── styles.css      // Styles principaux
│   │   ├── dark-mode.css   // Thème sombre
│   │   └── components.css  // Styles des composants
│   ├── pages
│   │   ├── home.html       // Page principale
│   │   ├── planning.html   // Planning journalier
│   │   ├── photos.html     // Checklist photos
│   │   └── about.html      // Page À propos
│   ├── components
│   │   ├── header.js       // En-tête de l'app
│   │   ├── weather.js      // Widget météo
│   │   └── checklist.js    // Composant checklist
│   └── assets
│       ├── icons
│       │   ├── icon-192x192.png
│       │   └── icon-512x512.png
│       ├── sounds
│       │   └── click.mp3    // Sons d'interface
│       └── images
│           └── locations    // Photos des lieux
├── public
│   ├── manifest.json       // Config PWA
│   └── robots.txt         // Indexation
├── index.html              // Point d'entrée
├── package.json            // Config Node.js
├── README.md               // Documentation
└── LICENSE                 // Licence MIT

## Installation
1. Clonez le dépôt : `git clone <url>`
2. Installez les dépendances : `npm install`
3. Lancez le serveur local : `npm start`
4. Accédez à `http://localhost:3000`

## Prérequis
- **Clé API OpenWeatherMap** : Obtenez une clé sur [OpenWeatherMap](https://openweathermap.org/api) et ajoutez-la dans `src/js/app.js` (variable `API_KEY`).
- **Icônes PWA** : Placez des icônes de 192x192 et 512x512 pixels dans `src/assets/icons/`.

## Développement
- **Dark Mode** : Basculer via le menu (persistant via localStorage).
- **Tone.js** : Sons pour clics, succès, et menu (CDN utilisé).
- **PWA** : Service Worker et manifest configurés pour mode hors-ligne et installation.

## Améliorations futures
- Intégration d'un vrai export PDF.
- Ajout de plus de jours dans `tripData`.
- Amélioration des animations avec GSAP.
- Intégration de cartes interactives.

## License
Ce projet est sous [Licence MIT](LICENSE).