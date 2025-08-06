/**
 * Gestion centralisée des notifications
 */

export function showNotification(message, type = 'info', duration = 3000) {
    // Créer le conteneur de notifications s'il n'existe pas
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        document.body.appendChild(container);
    }

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        padding: 12px 20px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s ease, transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    // Ajouter l'icône appropriée
    const icon = document.createElement('i');
    icon.className = getNotificationIcon(type);
    notification.appendChild(icon);
    
    // Ajouter le message
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    notification.appendChild(messageEl);
    
    // Ajouter la notification au conteneur
    container.appendChild(notification);
    
    // Animer l'entrée
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Supprimer la notification après la durée spécifiée
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
    
    return notification;
}

function getNotificationColor(type) {
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        default: '#333333'
    };
    return colors[type] || colors.default;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        default: 'fas fa-bell'
    };
    return icons[type] || icons.default;
}

// Fonction pour afficher une notification de succès
export function showSuccess(message, duration = 3000) {
    return showNotification(message, 'success', duration);
}

// Fonction pour afficher une erreur
export function showError(message, duration = 5000) {
    return showNotification(message, 'error', duration);
}

// Fonction pour afficher un avertissement
export function showWarning(message, duration = 4000) {
    return showNotification(message, 'warning', duration);
}

// Fonction pour afficher une information
export function showInfo(message, duration = 3000) {
    return showNotification(message, 'info', duration);
}
