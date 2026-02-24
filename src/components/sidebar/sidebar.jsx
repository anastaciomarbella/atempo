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
  const [user, setUser] = useState({
    empresaNombre: "Mi Empresa",
    empresaLogo: "/default-logo.png"
  });

  // 🔹 Leer usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          empresaNombre: parsedUser.empresaNombre || "Mi Empresa",
          empresaLogo: parsedUser.empresaLogo || "/default-logo.png"
        });
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }
  }, []);

  // 🔹 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate('/');
  };

  return (
    <aside className="sidebar">

      {/* Logo y nombre de empresa */}
      <div className="logo-section">
        <img
          src={user.empresaLogo}
          alt="Logo empresa"
          className="logo"
        />
        <h2 className="brand-name">{user.empresaNombre}</h2>
      </div>

      {/* Menú de navegación */}
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

      {/* Botón de cerrar sesión */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon logout-icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;