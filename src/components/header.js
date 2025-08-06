// DÉBOGAGE & REFACTORING: La fonction reçoit maintenant un objet contenant les callbacks
// `onMenuClick` et `onMenuSound`. Cela supprime la dépendance à l'objet global `window`.
export function renderHeader(container, { onMenuClick, onMenuSound }) {
    container.innerHTML = `
        <header>
            <h1><i class="fas fa-umbrella-beach"></i> Vacances La Rochelle</h1>
            <button id="menu-toggle-btn" aria-label="Ouvrir le menu" title="Menu">
                <i class="fas fa-bars"></i>
            </button>
        </header>
    `;
    
    const menuBtn = document.getElementById('menu-toggle-btn');
    if (menuBtn) {
        const menuClickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // On appelle les fonctions passées en paramètres.
            if (onMenuClick) onMenuClick();
            if (onMenuSound) onMenuSound();
        };

        menuBtn.addEventListener('click', menuClickHandler);
        // La gestion du touchend est une bonne pratique pour la réactivité sur mobile.
        menuBtn.addEventListener('touchend', menuClickHandler);
    }
}