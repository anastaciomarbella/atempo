import React, { useState } from "react";
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

  /* URL base de Supabase Storage */
  const SUPABASE_STORAGE =
    "https://bjstsqvzzczjiahlxffp.supabase.co/storage/v1/object/public/logo/";

  /* Construir URL del logo */
  const logoEmpresa = user.logo_url
    ? user.logo_url.startsWith("http")
      ? user.logo_url
      : `${SUPABASE_STORAGE}${user.logo_url}`
    : null;

  const linkPublico = slug
    ? `${window.location.origin}/reservar/${slug}`
    : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkPublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <aside className="sidebar">

      {/* EMPRESA Y USUARIO */}
      <div className="sidebar-profile">

        <div className="empresa-info">
          {logoEmpresa ? (
            <img
              src={logoEmpresa}
              alt="Logo empresa"
              className="empresa-logo"
            />
          ) : (
            <FaStore className="empresa-icon" />
          )}

          <span className="empresa-nombre">{nombreEmpresa}</span>
        </div>

        <div className="usuario-info">
          <FaUserCircle className="usuario-icon" />
          <span className="usuario-nombre">{nombreUsuario}</span>
        </div>

      </div>

      <div className="sidebar-divider" />

      {/* LINK PUBLICO */}
      {linkPublico && (
        <div className="link-publico">
          <span>Link de reservas para clientes:</span>

          <button onClick={copiarLink} className="btn-copiar-link">
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

      {/* CERRAR SESION */}
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