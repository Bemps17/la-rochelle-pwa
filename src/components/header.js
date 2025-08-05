export function renderHeader(container) {
    container.innerHTML = `
        <header>
            <h1>Vacances La Rochelle</h1>
            <button id="menu-toggle-btn"><i class="fas fa-bars"></i></button>
        </header>
    `;
    document.getElementById('menu-toggle-btn').addEventListener('click', () => {
        toggleMenu();
        window.menuSound();
    });
}