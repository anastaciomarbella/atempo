import React, { useEffect, useState } from 'react';
import './sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaPlus, 
  FaUsers, 
  FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});

  // 🔹 Leer usuario dinámicamente
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  return (
    <aside className="sidebar">

      {/* ✅ LOGO Y NOMBRE DINÁMICOS */}
      <div className="logo-section">
        <img 
          src={user?.empresaLogo || "/default-logo.png"} 
          alt="Logo empresa" 
          className="logo" 
        />
        <h2 className="brand-name">
          {user?.empresaNombre || "Mi Empresa"}
        </h2>
      </div>

      <nav className="menu">
        <NavLink 
          to="/agenda-diaria" 
          className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}
        >
          <FaCalendarDay className="icon" />
          Agenda diaria
        </NavLink>

        <NavLink 
          to="/agenda-semanal" 
          className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}
        >
          <FaCalendarWeek className="icon" />
          Agenda semanal
        </NavLink>

        <button
          onClick={() => onAbrirModal('cita')}
          className={`menu-btn ${modalActivo === 'cita' ? 'active' : ''}`}
        >
          <FaPlus className="icon" />
          Agendar cita
        </button>

        <NavLink 
          to="/empleados" 
          className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}
        >
          <FaUsers className="icon" />
          Empleados
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon logout-icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;