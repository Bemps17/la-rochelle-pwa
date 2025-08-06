export function renderHeader(container) {
    container.innerHTML = `
        <header>
            <h1>Vacances La Rochelle</h1>
            <button id="menu-toggle-btn" aria-label="Ouvrir le menu" title="Menu">
                <i class="fas fa-bars"></i>
            </button>
        </header>
    `;
    
    // Gestionnaire d'événement amélioré
    const menuBtn = document.getElementById('menu-toggle-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu button clicked'); // Debug
            if (window.toggleMenu) {
                window.toggleMenu();
            }
            if (window.menuSound) {
                window.menuSound();
            }
        });
        
        // Gestion tactile pour mobile
        menuBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.toggleMenu) {
                window.toggleMenu();
            }
            if (window.menuSound) {
                window.menuSound();
            }
        });
    }
}