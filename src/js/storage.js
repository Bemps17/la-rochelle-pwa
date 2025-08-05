export function loadState() {
    const storage = safeLocalStorage();
    window.appState.state.theme = storage.getItem('lr_theme') || 'light';
    window.appState.state.completedDays = JSON.parse(storage.getItem('lr_completed_days')) || [];
    window.appState.state.comments = JSON.parse(storage.getItem('lr_comments')) || {};
    window.appState.state.photoChecklist = JSON.parse(storage.getItem('lr_photos')) || {};
    window.appState.state.uploadedPhotos = JSON.parse(storage.getItem('lr_uploaded_photos')) || {};
}

export function saveState() {
    const storage = safeLocalStorage();
    storage.setItem('lr_theme', window.appState.state.theme);
    storage.setItem('lr_completed_days', JSON.stringify(window.appState.state.completedDays));
    storage.setItem('lr_comments', JSON.stringify(window.appState.state.comments));
    storage.setItem('lr_photos', JSON.stringify(window.appState.state.photoChecklist));
    storage.setItem('lr_uploaded_photos', JSON.stringify(window.appState.state.uploadedPhotos));
}

function safeLocalStorage() {
    try {
        if (typeof Storage !== 'undefined' && window.localStorage) {
            return {
                getItem: key => { try { return localStorage.getItem(key); } catch (e) { console.warn('localStorage getItem failed:', e); return null; } },
                setItem: (key, value) => { try { localStorage.setItem(key, value); } catch (e) { console.warn('localStorage setItem failed:', e); } }
            };
        }
    } catch (e) { console.warn('localStorage not available:', e); }
    return { getItem: () => null, setItem: () => {} };
}