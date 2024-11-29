// connectivity.js

class ConnectivityHandler {
    constructor() {
        this.customMessages = {
            offline: 'No hay conexión',
            online: 'Conexión restaurada'
        };
        this.callbacks = {
            offline: [],
            online: []
        };
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
            this.executeCallbacks('online');
        });
        
        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
            this.executeCallbacks('offline');
        });
        
        // Estado inicial
        this.updateOnlineStatus(navigator.onLine);
    }

    onOffline(callback) {
        this.callbacks.offline.push(callback);
    }

    onOnline(callback) {
        this.callbacks.online.push(callback);
    }

    executeCallbacks(type) {
        this.callbacks[type].forEach(callback => callback());
    }

    setCustomMessages(messages) {
        this.customMessages = {
            ...this.customMessages,
            ...messages
        };
    }

    async checkServerConnection() {
        try {
            const response = await fetch('/api/health-check', {
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    updateOnlineStatus(isOnline) {
        const message = isOnline ? 
            this.customMessages.online : 
            this.customMessages.offline;
        
        this.showNotification(message);
        
        // Actualizar UI global
        document.body.classList.toggle('is-offline', !isOnline);
        
        // Actualizar estado en localStorage para persistencia
        localStorage.setItem('connectionState', isOnline ? 'online' : 'offline');
    }

    showNotification(message) {
        // ... (código de notificación anterior)
    }

    // Nuevo método para sincronizar datos pendientes
    async syncPendingData() {
        if (!navigator.onLine) return;

        const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        
        for (const request of pendingRequests) {
            try {
                await fetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body
                });
            } catch (error) {
                console.error('Error syncing:', error);
            }
        }

        localStorage.removeItem('pendingRequests');
    }

    // Guardar petición para sincronización posterior
    savePendingRequest(request) {
        const pendingRequests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        pendingRequests.push(request);
        localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
    }
}

const connectivityHandler = new ConnectivityHandler();
export default connectivityHandler;