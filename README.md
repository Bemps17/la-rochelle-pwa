# 🏖️ La Rochelle PWA - Guide de Vacances Interactif

Une Progressive Web App moderne pour planifier vos vacances à La Rochelle, avec météo, activités par jour, checklist photos, et mode hors-ligne.

## ✨ Fonctionnalités

- **🌤️ Météo adaptative** : Prévisions sur 10 jours avec recommandations selon la météo
- **📅 Planning intelligent** : Activités adaptées au temps (soleil/pluie), budget, et liens utiles
- **📸 Checklist photos** : Suivez vos captures des lieux emblématiques avec upload d'images
- **🌙 Mode sombre** : Interface avec contraste amélioré pour une meilleure lisibilité
- **🔊 Sons interactifs** : Effets sonores discrets avec Web Audio API (optionnel)
- **📱 PWA complète** : Installation sur mobile/desktop, mode hors-ligne
- **💾 Sauvegarde locale** : Vos données sont conservées même sans internet

## 🚀 Installation et démarrage

### Prérequis
- **Serveur web local** (serve, live-server, python, ou autre)
- **Navigateur moderne** avec support ES6+ (Chrome, Firefox, Safari, Edge)
- **Clé API OpenWeatherMap** (optionnelle - données de test incluses)

### Installation
```bash
# Option 1: Avec npm
npm install
npm start

# Option 2: Avec serve
npx serve .

# Option 3: Avec Python
python -m http.server 8000

# Option 4: Avec PHP
php -S localhost:8000
```

### Configuration (optionnelle)

1. **API Météo** : Pour avoir de vraies données météo, obtenez une clé gratuite sur [OpenWeatherMap](https://openweathermap.org/api) et remplacez dans `src/js/app.js` et `src/js/weather.js` :
   ```javascript
   const API_KEY = 'VOTRE_CLE_API_ICI';
   ```

2. **Icônes PWA** : Ajoutez vos icônes personnalisées dans `src/assets/icons/` :
   - `icon-192x192.png`
   - `icon-512x512.png`

## 🛠️ Corrections apportées

### ✅ Problèmes résolus

1. **Menu hamburger inaccessible** 
   - ✅ Bouton menu agrandi (48x48px minimum)
   - ✅ Zone de clic améliorée avec padding
   - ✅ Gestionnaires d'événements multiples (click + touchend)
   - ✅ Styles hover/active pour feedback visuel

2. **Sons Tone.js désagréables**
   - ✅ Remplacement par Web Audio API native
   - ✅ Sons très discrets (volume 0.05-0.08)
   - ✅ Durée courte (50-100ms)
   - ✅ Ondes sinusoïdales douces
   - ✅ Initialisation seulement après interaction utilisateur

3. **Erreurs JavaScript**
   - ✅ Toutes les fonctions globales définies
   - ✅ Gestion d'erreurs robuste avec fallbacks
   - ✅ Modules ES6 correctement importés
   - ✅ États d'application centralisés

4. **Interface utilisateur**
   - ✅ Notifications toast non-intrusives
   - ✅ Navigation tactile améliorée
   - ✅ Responsive design mobile-first
   - ✅ Accessibilité WCAG respectée

## 📱 Utilisation

### Navigation
- **Menu** : Cliquez sur le bouton ☰ en haut à droite
- **Pages** : Accueil, Planning, Photos, À propos
- **Swipe** : Glissez sur le carrousel météo et pour fermer le menu

### Météo
- **Modes** : Auto (recommandé), Soleil, Pluie, Mixte
- **Carrousel** : Naviguez dans les 10 jours de prévisions
- **Actualisation** : Bouton ↻ pour rafraîchir

### Planning
- **Jours** : Cliquez pour ouvrir/fermer les détails
- **Activités** : Adaptées automatiquement à la météo
- **Notes** : Ajoutez vos commentaires personnels
- **Archivage** : Marquez les jours comme terminés

### Photos
- **Checklist** : 16 lieux emblématiques à photographier
- **Upload** : Chargez vos photos pour chaque lieu
- **Progression** : Suivez votre avancement visuel

## 🎨 Personnalisation

### Thèmes
- **Mode clair** : Design coloré pour le jour
- **Mode sombre** : Interface sombre pour les yeux
- **Commutation** : Via le menu ou automatique selon l'OS

### Sons
- **Activation** : Au premier clic sur la page
- **Types** : Clic (800Hz), Succès (1000Hz), Menu (600Hz)
- **Désactivation** : Automatique si non supporté

## 🏗️ Architecture technique

### Structure des fichiers
```
la-rochelle-pwa/
├── index.html              # Point d'entrée
├── src/
│   ├── js/
│   │   ├── app.js          # ✅ Application principale
│   │   ├── weather.js      # ✅ Service météo
│   │   ├── storage.js      # ✅ Gestion localStorage
│   │   └── sw.js           # Service Worker
│   ├── css/
│   │   ├── styles.css      # ✅ Styles principaux
│   │   ├── dark-mode.css   # Thème sombre
│   │   └── components.css  # Composants
│   ├── components/
│   │   ├── header.js       # ✅ En-tête avec menu
│   │   ├── weather.js      # Widget météo
│   │   └── checklist.js    # ✅ Checklist photos
│   ├── pages/
│   │   ├── home.html       # ✅ Page d'accueil
│   │   ├── planning.html   # ✅ Planning détaillé
│   │   ├── photos.html     # ✅ Checklist photos
│   │   └── about.html      # ✅ À propos
│   └── assets/
│       ├── icons/          # Icônes PWA
│       └── images/         # Images statiques
├── public/
│   ├── manifest.json       # Configuration PWA
│   └── robots.txt         # SEO
├── package.json            # Configuration npm
├── LICENSE                 # Licence MIT
└── README.md              # Cette documentation
```

### Technologies utilisées
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS
- **JavaScript ES6+** : Modules, classes, async/await
- **Web Audio API** : Sons interactifs natifs
- **Service Workers** : Cache et mode hors-ligne
- **localStorage** : Sauvegarde des données utilisateur
- **Fetch API** : Requêtes météo asynchrones

## 🔧 Développement

### Scripts disponibles
```bash
npm start          # Démarrer le serveur de développement
npm run build      # Build de production (à implémenter)
npm run test       # Tests (à implémenter)
```

### Variables d'environnement
```javascript
// Configuration dans src/js/app.js
const API_KEY = 'YOUR_VALID_API_KEY_HERE'; // Clé météo
const LA_ROCHELLE_LAT = 46.1603;           // Latitude
const LA_ROCHELLE_LON = -1.1493;           // Longitude
```

## 🌐 Déploiement

### Serveur web statique
L'application fonctionne avec n'importe quel serveur web statique :
- **Netlify** : Déployez directement depuis GitHub
- **Vercel** : Déploiement automatique
- **GitHub Pages** : Hébergement gratuit
- **Apache/Nginx** : Serveurs traditionnels

### Configuration HTTPS
Pour les fonctionnalités PWA complètes en production, HTTPS est requis.

### Cache et performances
- Service Worker configuré pour le cache des assets
- Images optimisées et lazy loading
- Minification recommandée pour la production

## 🐛 Dépannage

### Problèmes courants

**Menu ne s'ouvre pas :**
- Vérifiez que JavaScript est activé
- Ouvrez la console pour voir les erreurs
- Rechargez la page

**Météo ne se charge pas :**
- Normal sans clé API (données de test utilisées)
- Vérifiez votre connexion internet
- Configurez une clé API pour de vraies données

**Sons ne marchent pas :**
- Normal sur certains navigateurs/appareils
- Les sons s'activent après le premier clic
- Fonctionnalité optionnelle, ne bloque pas l'app

**Photos ne se sauvegardent pas :**
- Vérifiez l'espace de stockage disponible
- Assurez-vous que localStorage est activé
- Les images sont stockées en base64

## 📊 Performance

### Métriques cibles
- **First Contentful Paint** : < 2s
- **Largest Contentful Paint** : < 3s
- **Cumulative Layout Shift** : < 0.1
- **Time to Interactive** : < 3s

### Optimisations
- CSS inline pour éviter le FOUC
- Images au format moderne (WebP recommandé)
- Lazy loading des composants
- Service Worker pour le cache

## 📄 Licence

Ce projet est sous [Licence MIT](LICENSE) - voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités
- Améliorer la documentation

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Vérifiez les logs de la console du navigateur

---

**Bon voyage à La Rochelle ! 🏖️⛵**