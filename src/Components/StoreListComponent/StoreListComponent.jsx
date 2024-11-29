import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './StoreListComponent.css'; 
import { useConnectivity } from '../../context/ConnectivityProvider';

const StoreListComponent = () => {
  const [stores, setStores] = useState([]);
  const [hoveredStoreId, setHoveredStoreId] = useState(null);
  const navigate = useNavigate();
  const { isOnline, showNotification } = useConnectivity();

  const saveToLocalStorage = (stores) => {
    localStorage.setItem('cachedStores', JSON.stringify(stores));
    localStorage.setItem('storesLastUpdate', new Date().toISOString());
  };

  const getFromLocalStorage = () => {
    const cached = localStorage.getItem('cachedStores');
    return cached ? JSON.parse(cached) : [];
  };

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    // Si ya se han rechazado las notificaciones antes, no volver a preguntar
    if (localStorage.getItem('notificationsDenied')) {
      return;
    }

    // Si ya están concedidas, no volver a preguntar
    if (Notification.permission === 'granted') {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BL8TL4HNOLqhA819AaYm7ifoluzHeabMLZtQjHnkpz_j95PxnTub_0u8lp2pG4vFXXIO01Uf6dTuXuFIjR-ctVM'
        });

        const userId = localStorage.getItem('userId');
        await fetch('http://localhost:3000/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription,
            userId: userId
          }),
        });
      } else if (permission === 'denied') {
        // Guardar que el usuario ha rechazado para no volver a preguntar
        localStorage.setItem('notificationsDenied', 'true');
      }
    } catch (error) {
      console.error('Error al configurar notificaciones:', error);
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
      if (!isOnline) {
        const cachedStores = getFromLocalStorage();
        setStores(cachedStores);
        showNotification('Modo Offline', 'Mostrando tiendas guardadas localmente', 'info');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/tienda');
        if (response.ok) {
          const data = await response.json();
          const activeStores = data.filter(store => store.activo === 1);
          setStores(activeStores);
          saveToLocalStorage(activeStores);
        }
      } catch (error) {
        console.error('Error:', error);
        const cachedStores = getFromLocalStorage();
        if (cachedStores.length > 0) {
          setStores(cachedStores);
          showNotification('Error de conexión', 'Mostrando tiendas guardadas localmente', 'warning');
        }
      }
    };

    fetchStores();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      const lastUpdate = localStorage.getItem('storesLastUpdate');
      if (lastUpdate) {
        const timeDiff = new Date() - new Date(lastUpdate);
        if (timeDiff > 5 * 60 * 1000) {
          const fetchStores = async () => {
            try {
              const response = await fetch('http://localhost:3000/tienda');
              if (response.ok) {
                const data = await response.json();
                const activeStores = data.filter(store => store.activo === 1);
                setStores(activeStores);
                saveToLocalStorage(activeStores);
                showNotification('Sincronización', 'Lista de tiendas actualizada', 'success');
              }
            } catch (error) {
              console.error('Error al sincronizar:', error);
            }
          };
          fetchStores();
        }
      }
    }
  }, [isOnline]);

  const handleVisit = async (storeId) => {
    // Solicitar permisos de notificación al visitar una tienda
    await requestNotificationPermission();
    
    console.log("Visiting store ID:", storeId);
    localStorage.setItem('IdTienda', storeId);
    navigate('/lista-productos');
  };

  return (
    <div className="store-list-container">
      <div className="store-list">
        {stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.ID_Tienda}
              className="store-card"
              onMouseEnter={() => setHoveredStoreId(store.ID_Tienda)}
              onMouseLeave={() => setHoveredStoreId(null)}
            >
              {store.logo && (
                <img
                  src={`http://localhost:3000/uploads/${store.logo}`}
                  alt={`${store.NombreTienda} logo`}
                  className="store-logo"
                />
              )}
              <div className="store-details">
                <h3 className="store-name">{store.NombreTienda}</h3>
                <p className="store-description">{store.Descripcion}</p>
              </div>
              <button
                className={`visit-button ${hoveredStoreId === store.ID_Tienda ? 'visible' : ''}`}
                onClick={() => handleVisit(store.ID_Tienda)}
              >
                Visitar
              </button>
            </div>
          ))
        ) : (
          <p>No hay tiendas disponibles</p>
        )}
      </div>
    </div>
  );
};

export default StoreListComponent;