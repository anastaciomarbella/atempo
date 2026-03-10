import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import "./header.css";

const Header = ({ onToggleSidebar }) => {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  // ✅ Se actualiza cuando cambia el usuario (login / configuración)
  useEffect(() => {
    const actualizar = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };
    window.addEventListener("user-updated", actualizar);
    return () => window.removeEventListener("user-updated", actualizar);
  }, []);

  const nombreEmpresa = user.nombre_empresa || "Mi Empresa";
  const logoEmpresa   = user.logo_url || null;

  return (
    <div className="top-header">

      {/* ☰ Botón hamburguesa — solo visible en móvil */}
      <button className="hamburger-btn" onClick={onToggleSidebar}>
        <FaBars />
      </button>

      <div className="empresa-container">
        {logoEmpresa && (
          <img
            src={logoEmpresa}
            alt="logo"
            className="empresa-logo-header"
          />
        )}
        <h2 className="business-name">{nombreEmpresa}</h2>
      </div>

    </div>
  );

};

export default Header;