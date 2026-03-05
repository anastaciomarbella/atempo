import React, { useEffect } from "react";
import "./sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
  FaStore,
  FaUserCircle,
} from "react-icons/fa";

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const nombreEmpresa = user.nombre_empresa || "Mi Empresa";
  const nombreUsuario = user.nombre || "Usuario";

  useEffect(() => {
    console.log("🟡 Sidebar montado correctamente");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">

      {/* 🔹 EMPRESA Y USUARIO */}
      <div className="sidebar-profile">
        <div className="empresa-info">
          <FaStore className="empresa-icon" />
          <span className="empresa-nombre">{nombreEmpresa}</span>
        </div>
        <div className="usuario-info">
          <FaUserCircle className="usuario-icon" />
          <span className="usuario-nombre">{nombreUsuario}</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* 🔹 MENÚ */}
      <nav className="menu">
        <NavLink
          to="/agenda-diaria"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaCalendarDay className="icon" />
          Agenda diaria
        </NavLink>

        <NavLink
          to="/agenda-semanal"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaCalendarWeek className="icon" />
          Agenda semanal
        </NavLink>

        <button
          type="button"
          onClick={() => onAbrirModal && onAbrirModal("cita")}
          className={`menu-btn ${modalActivo === "cita" ? "active" : ""}`}
        >
          <FaPlus className="icon" />
          Agendar cita
        </button>

        <NavLink
          to="/empleados"
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaUsers className="icon" />
          Empleados
        </NavLink>
      </nav>

      {/* 🔹 CERRAR SESIÓN */}
      <button type="button" className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="icon" />
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;