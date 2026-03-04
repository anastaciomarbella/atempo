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
      const httpsUrl = logoUrl.replace(/^http:\/\//i, "https://");
      console.log("Logo absoluto convertido a HTTPS:", httpsUrl);
      return httpsUrl;
    }

    // Si es relativa, agregar API_URL
    const fullUrl = `${API_URL}/${logoUrl}`;
    console.log("Logo relativo convertido a URL completa:", fullUrl);
    return fullUrl;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Usuario desde localStorage:", parsedUser);

        // Nombre de la empresa
        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");

        // URL segura del logo
        const safeLogo = getSafeLogoUrl(parsedUser.logo_url);
        console.log("URL final del logo:", safeLogo);
        setLogo(safeLogo);
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    } else {
      console.log("No hay usuario en localStorage");
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
              console.error("Error cargando la imagen del logo:", e.target.src);
              // Mostrar placeholder en caso de error
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