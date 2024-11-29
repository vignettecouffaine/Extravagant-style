import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LoginComponent.css';

export default function LoginComponent() {
  const [Correo, setCorreo] = useState("");
  const [Contraseña, setContraseña] = useState("");
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("¡Conexión restablecida!", { position: "top-right" });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Sin conexión. No se puede iniciar sesión.", { position: "top-right" });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loginUsuario = async () => {
    if (!isOnline) {
      toast.error("No hay conexión a internet. Por favor, conéctese e intente de nuevo.", { position: "top-right" });
      return;
    }

    setLoading(true);
    setError("");
    const objetoParaBackend = { Correo, Contraseña };

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objetoParaBackend)
      });

      const data = await response.json();

      if (response.ok) {
        setLoginExitoso(true);
        localStorage.setItem('userEmail', data.usuario.Correo);
        localStorage.setItem('userId', data.usuario.ID_Usuario);
        localStorage.setItem('userRole', data.usuario.Rol);

        toast.success("¡Inicio de sesión exitoso!", { position: "top-right" });


        switch (data.usuario.Rol) {
          case "admin":
            navigate("/");
            break;
          case "vendedor":
            navigate("/seller");
            break;
          default:
            navigate("/home"); 
        }
      } else {
        console.error('Error del backend:', data);
        toast.error("Error en el inicio de sesión. Verifique sus credenciales.", { position: "top-right" });
      }
    } catch (error) {
      setError("Error al conectar con el backend");
      toast.error("Error de conexión con el servidor.", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (!isOnline) {
      toast.error("No hay conexión a internet. Por favor, conéctese e intente de nuevo.", { position: "top-right" });
      return;
    }

    if (Correo.trim() !== "" && Contraseña.trim() !== "") {
      loginUsuario();
    } else {
      toast.warn("Por favor complete todos los campos antes de iniciar sesión.", { position: "top-right" });
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <div className="form-container">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h4>Clientes Registrados</h4>
        {loginExitoso && <div className="mensaje-exitoso">¡Inicio de sesión exitoso!</div>}
        {error && <div className="mensaje-error">{error}</div>}
        {loading && <div className="loading">Cargando...</div>}
        <div className="input-container">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={Correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Contraseña"
            value={Contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />
        </div>
        <p className="link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
        <button
          onClick={handleLoginClick}
          className="button iniciar-sesion rounded-full"
          disabled={loading || !isOnline}
        >
          Iniciar sesión
        </button>
        <div className={`estado-conexion ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'En línea' : 'Sin conexión'}
        </div>
      </div>
    </div>
  );
}
