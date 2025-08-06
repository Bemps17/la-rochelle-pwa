// DÉBOGAGE & REFACTORING: Les données de la checklist sont maintenant un tableau d'objets.
// Cela sépare les données de la présentation et rend le code beaucoup plus facile à maintenir.
// On peut maintenant obtenir le nombre total de photos dynamiquement (photoData.length).
const photoData = [
    { id: 'tours', label: 'Les trois Tours emblématiques' },
    { id: 'arcades', label: 'Rues à arcades (Rue des Merciers)' },
    { id: 'horloge', label: 'Grosse Horloge' },
    { id: 'hoteldeville', label: 'Détails Hôtel de Ville' },
    { id: 'sunset', label: 'Couchers soleil depuis remparts' },
    { id: 'phare', label: 'Phare du Bout du Monde' },
    { id: 'minimes', label: 'Port des Minimes' },
    { id: 'reflets', label: 'Reflets sable mouillé Châtelaillon' },
    { id: 'baleines', label: 'Phare des Baleines crépuscule' },
    { id: 'conche', label: 'Plage de la Conche' },
    { id: 'marais', label: 'Marais salants géométriques' },
    { id: 'saintmartin', label: 'Port Saint-Martin-de-Ré' },
    { id: 'corderie', label: 'Corderie Royale monumentale' },
    { id: 'radoub', label: 'Formes de radoub historiques' },
    { id: 'charruyer', label: 'Canaux Parc Charruyer' },
    { id: 'fortboyard', label: 'Fort Boyard depuis la mer' },
];

export function renderChecklist() {
    const checklistContainer = document.querySelector('#checklist');
    if (!checklistContainer) return;

    // DÉBOGAGE & REFACTORING: Le HTML est généré dynamiquement à partir du tableau `photoData`.
    // Fini la longue chaîne de caractères HTML difficile à lire.
    checklistContainer.innerHTML = `
        <div class="checklist-container">
            <div class="progress-summary">
                <div class="progress-card">
                     <div class="progress-icon"><i class="fas fa-camera-retro"></i></div>
                     <div class="progress-info">
                        <div class="progress-text" id="photoProgressText">0/${photoData.length} photos capturées</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="photoProgressFill" style="width: 0%;"></div>
                        </div>
                     </div>
                </div>
            </div>
            ${photoData.map(item => `
                <div class="photo-item" data-id="${item.id}">
                    <input type="checkbox" id="photo-${item.id}">
                    <label for="photo-${item.id}" class="photo-label">${item.label}</label>
                    <div class="photo-upload-container">
                        <button class="photo-upload-btn"><i class="fas fa-upload"></i></button>
                        <input type="file" class="photo-upload-input" accept="image/*" style="display: none;">
                        <img id="photo-preview-${item.id}" class="photo-preview" style="display: none;">
                    </div>
                </div>
            `).join('')}
        </div>`;

    // DÉBOGAGE & REFACTORING: Ajout des écouteurs d'événements pour remplacer les 'onclick'.
    addChecklistEventListeners();
    loadChecklistState();
}

function addChecklistEventListeners() {
    document.querySelectorAll('.photo-item').forEach(item => {
        const id = item.dataset.id;
        const checkbox = item.querySelector('input[type="checkbox"]');
        const uploadBtn = item.querySelector('.photo-upload-btn');
        const fileInput = item.querySelector('.photo-upload-input');

        // Gérer le clic sur la case à cocher
        checkbox.addEventListener('change', () => {
            window.appState.state.photoChecklist[`photo-${id}`] = checkbox.checked;
            updatePhotoProgress();
            // La sauvegarde est gérée par une fonction globale saveState() appelée après l'action
        });
        
        // Gérer le clic sur le bouton de chargement
        uploadBtn.addEventListener('click', () => fileInput.click());

        // Gérer le changement du fichier
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById(`photo-preview-${id}`);
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    window.appState.state.uploadedPhotos[`photo-${id}`] = e.target.result;
                    // Marquer la case comme cochée lors du chargement d'une photo
                    if(!checkbox.checked) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function loadChecklistState() {
    Object.entries(window.appState.state.photoChecklist).forEach(([key, value]) => {
        const checkbox = document.getElementById(key);
        if (checkbox) checkbox.checked = value;
    });

    Object.entries(window.appState.state.uploadedPhotos).forEach(([key, value]) => {
        const id = key.replace('photo-', '');
        const preview = document.getElementById(`photo-preview-${id}`);
        if (preview && value) {
            preview.src = value;
            preview.style.display = 'block';
        }
    });

    updatePhotoProgress();
}

function updatePhotoProgress() {
    const completedPhotos = Object.values(window.appState.state.photoChecklist).filter(Boolean).length;
    const totalPhotos = photoData.length;
    const percentage = totalPhotos > 0 ? Math.round((completedPhotos / totalPhotos) * 100) : 0;
    
    const progressText = document.getElementById('photoProgressText');
    const progressFill = document.getElementById('photoProgressFill');

    if (progressText) progressText.textContent = `${completedPhotos}/${totalPhotos} photos capturées`;
    if (progressFill) progressFill.style.width = `${percentage}%`;
}