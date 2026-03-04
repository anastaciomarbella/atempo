import React, { useEffect, useState } from "react";
import "./header.css";
import { API_URL } from "../../config";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");

        if (parsedUser.logo_url) {
          // Forzar HTTPS automáticamente si viene con http://
          const safeUrl = parsedUser.logo_url.replace(/^http:\/\//i, "https://");

          // Si la URL es relativa, agregar el API_URL
          const finalUrl = safeUrl.startsWith("https://")
            ? safeUrl
            : `${API_URL}/${safeUrl}`;

          setLogo(finalUrl);
        }
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
            className="empresa-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="logo-placeholder">
            {empresa.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="business-name">{empresa}</h1>
      </div>
    </header>
  );
};

export default Header;