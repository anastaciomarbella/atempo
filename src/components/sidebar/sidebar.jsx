import React from 'react';
import './sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCalendarDay, FaCalendarWeek, FaPlus, FaUsers, FaStar, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/LogoAtempoPNG.png';

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <img src={logo} alt="Logo Atempo" className="logo" />
        <h2 className="brand-name">Atempo</h2>
      </div>

      <nav className="menu">
        <NavLink to="/agenda-diaria" className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}>
          <FaCalendarDay className="icon" />
          Agenda diaria
        </NavLink>
        <NavLink to="/agenda-semanal" className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}>
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
        <NavLink to="/empleados" className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}>
          <FaUsers className="icon" />
          Empleados
        </NavLink>
        {/* <NavLink to="/clientes-frecuentes" className={({ isActive }) => (isActive && modalActivo !== 'cita' ? 'active' : '')}>
          <FaStar className="icon" />
          Clientes frecuentes
        </NavLink> */}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon logout-icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
