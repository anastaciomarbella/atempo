import React, { useEffect, useState } from "react";
import "./header.css";
import { API_URL } from "../../config";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");
  const [logo, setLogo] = useState(null);

  // Función para obtener una URL segura para la imagen
  const getSafeLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;

    // Si la URL es absoluta (http o https), forzar https
    if (/^https?:\/\//i.test(logoUrl)) {
      return logoUrl.replace(/^http:\/\//i, "https://");
    }

    // Si es relativa, agregar API_URL
    return `${API_URL}/${logoUrl}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Nombre de la empresa
        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");

        // URL segura del logo
        setLogo(getSafeLogoUrl(parsedUser.logo_url));
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
              // Si falla la carga, mostrar placeholder
              e.target.onerror = null;
              e.target.src = null;
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