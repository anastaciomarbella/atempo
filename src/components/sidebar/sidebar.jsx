import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultLogo from "../assets/default-logo.png";
import "./sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">

      {/* 🔥 EMPRESA DINÁMICA */}
      <div className="sidebar-header">
        <img
          src={user.empresaLogo || defaultLogo}
          alt="Logo empresa"
          className="logo-empresa"
        />
        <h3 className="nombre-empresa">
          {user.empresaNombre || "Mi Empresa"}
        </h3>
      </div>

      <nav>
        <NavLink to="/agenda-diaria">
          <FaCalendarDay /> Agenda diaria
        </NavLink>

        <NavLink to="/agenda-semanal">
          <FaCalendarWeek /> Agenda semanal
        </NavLink>

        <NavLink to="/agendar-cita">
          <FaPlus /> Agendar cita
        </NavLink>

        <NavLink to="/empleados">
          <FaUsers /> Empleados
        </NavLink>
      </nav>

      <button className="cerrar-btn" onClick={cerrarSesion}>
        <FaSignOutAlt /> Cerrar sesión
      </button>

    </div>
  );
};

export default Sidebar;