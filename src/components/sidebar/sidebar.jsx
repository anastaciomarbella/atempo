import React, { useState } from "react";
import "./sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaCopy,
  FaCog
} from "react-icons/fa";

const Sidebar = ({ onAbrirModal, modalActivo, citasNuevas, onMarcarVistas }) => {

  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const nombreEmpresa = user.nombre_empresa || "Mi Empresa";
  const nombreUsuario = user.nombre || "Usuario";
  const slug = user.slug;

  const linkPublico = slug
    ? `${window.location.origin}/reservar/${slug}`
    : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const copiarLink = () => {
    if (!linkPublico) return;

    navigator.clipboard.writeText(linkPublico);
    setCopiado(true);

    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <aside className="sidebar">

      {/* EMPRESA */}
      <div className="sidebar-profile">

        <div className="empresa-info">
          <span className="empresa-nombre">
            {nombreEmpresa}
          </span>
        </div>

        {/* USUARIO */}
        <div className="usuario-info">

          <FaUserCircle className="usuario-icon" />

          <span className="usuario-nombre">
            {nombreUsuario}
          </span>

        </div>

      </div>

      <div className="sidebar-divider" />

      {/* LINK PUBLICO */}
      {linkPublico && (
        <div className="link-publico">

          <span>Link de reservas para clientes:</span>

          <button
            onClick={copiarLink}
            className="btn-copiar-link"
          >
            <FaCopy />

            {copiado ? "¡Copiado!" : "Copiar link"}
          </button>

        </div>
      )}

      <div className="sidebar-divider" />

      {/* MENU */}
      <nav className="menu">

        <NavLink
          to="/agenda-diaria"
          onClick={onMarcarVistas}
          className={({ isActive }) =>
            isActive && modalActivo !== "cita" ? "active" : ""
          }
        >
          <FaCalendarDay className="icon" />
          Agenda diaria

          {citasNuevas > 0 && (
            <span className="badge-notificacion">
              {citasNuevas}
            </span>
          )}

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

      <div className="sidebar-divider" />

      {/* CONFIGURACION */}
      <NavLink
        to="/configuracion"
        className={({ isActive }) =>
          isActive ? "config-btn active" : "config-btn"
        }
      >
        <FaCog className="icon" />
        Configuración
      </NavLink>

      {/* LOGOUT */}
      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt className="icon" />
        Cerrar sesión
      </button>

    </aside>
  );
};

export default Sidebar;