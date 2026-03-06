import React, { useEffect, useState } from "react";
import "./header.css";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setEmpresa(parsedUser?.nombre_empresa || "Mi Empresa");
        setLogo(parsedUser?.logo_url || null);
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }
  }, []);

  return (
    <header className="top-header">
      <div className="empresa-container">

        {logo ? (
          <img
            src={logo}
            alt="Logo empresa"
            className="empresa-logo-header"
          />
        ) : (
          <div className="logo-placeholder">
            {empresa ? empresa.charAt(0).toUpperCase() : "?"}
          </div>
        )}

        <h1 className="business-name">
          {empresa || "Mi Empresa"}
        </h1>

      </div>
    </header>
  );
};

export default Header;