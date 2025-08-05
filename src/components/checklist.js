export function renderChecklist() {
    const checklistContainer = document.querySelector('#checklist');
    if (!checklistContainer) {
        console.warn('Conteneur checklist introuvable');
        return;
    }
    checklistContainer.innerHTML = `
        <h2>Checklist Photos</h2>
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
        <div style="background: var(--secondary-color); padding: 12px; border-radius: 8px; text-align: center;">
            <div id="photoProgress">0/16 photos prises (0%)</div>
        </div>`;
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

function updatePhotoProgress() {
    const totalPhotos = 16;
    const completedPhotos = Object.values(window.appState.state.photoChecklist).filter(Boolean).length;
    const percentage = Math.round((completedPhotos / totalPhotos) * 100);
    const photoProgress = document.getElementById('photoProgress');
    if (photoProgress) {
        photoProgress.textContent = `${completedPhotos}/${totalPhotos} photos prises (${percentage}%)`;
    }
}