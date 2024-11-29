import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="overlay">
        <h1 className="title">Bienvenido a Extravagant Style® </h1>
        <h2 className="subtitle">Encuentra el estilo perfecto para ti</h2>
        <div className="buttons-container">
          <Link to="/login" className="shop-button">Iniciar Sesión</Link>
          <Link to="/registro" className="shop-button" style={{ marginLeft: '10px' }}>Registrarse</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
