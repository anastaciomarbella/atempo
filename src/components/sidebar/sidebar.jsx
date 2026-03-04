import React, { useEffect } from "react";
import "./sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ onAbrirModal, modalActivo }) => {
  const navigate = useNavigate();

  // 🔍 Ver si el componente realmente se renderiza
  console.log("🟢 Sidebar renderizado");

  // 🔍 Ver qué props están llegando
  console.log("📦 Props recibidas:", {
    onAbrirModal,
    modalActivo,
  });

  useEffect(() => {
    console.log("🟡 Sidebar montado correctamente");
  }, []);

  const handleLogout = () => {
    console.log("🔴 Logout ejecutado");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      {console.log("🎯 Render del return ejecutado")}

      {/* 🔹 MENÚ */}
      <nav className="menu">
        <NavLink
          to="/agenda-diaria"
          className={({ isActive }) => {
            console.log("📅 Agenda diaria isActive:", isActive);
            return isActive && modalActivo !== "cita" ? "active" : "";
          }}
        >
          <FaCalendarDay className="icon" />
          Agenda diaria
        </NavLink>

        <NavLink
          to="/agenda-semanal"
          className={({ isActive }) => {
            console.log("📆 Agenda semanal isActive:", isActive);
            return isActive && modalActivo !== "cita" ? "active" : "";
          }}
        >
          <FaCalendarWeek className="icon" />
          Agenda semanal
        </NavLink>

        <button
          type="button"
          onClick={() => {
            console.log("➕ Click en Agendar cita");
            if (!onAbrirModal) {
              console.error("❌ onAbrirModal es undefined");
            }
            onAbrirModal && onAbrirModal("cita");
          }}
          className={`menu-btn ${
            modalActivo === "cita" ? "active" : ""
          }`}
        >
          <FaPlus className="icon" />
          Agendar cita
        </button>

        <NavLink
          to="/empleados"
          className={({ isActive }) => {
            console.log("👥 Empleados isActive:", isActive);
            return isActive && modalActivo !== "cita" ? "active" : "";
          }}
        >
          <FaUsers className="icon" />
          Empleados
        </NavLink>
      </nav>

      {/* 🔹 CERRAR SESIÓN */}
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