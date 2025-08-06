// Script pour générer les icônes manquantes
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Dossier de destination des icônes
const iconsDir = path.join(__dirname, 'public', 'assets', 'icons');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`Dossier créé : ${iconsDir}`);
}

// Tailles d'icônes requises
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Couleurs de l'application
const colors = {
  primary: '#E63946',
  secondary: '#FFFFFF',
  text: '#1D1D1D'
};

// Générer chaque icône
iconSizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fond
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, size, size);
  
  // Texte au centre
  ctx.fillStyle = colors.secondary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Ajuster la taille de la police en fonction de la taille de l'icône
  const fontSize = Math.floor(size * 0.5);
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Dessiner le texte "LR" (La Rochelle)
  ctx.fillText('LR', size / 2, size / 2);
  
  // Ajouter un contour pour une meilleure visibilité
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = Math.max(1, size * 0.02);
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
  
  // Sauvegarder l'image
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Icône générée : ${outputPath}`);
});

console.log('Génération des icônes terminée !');
