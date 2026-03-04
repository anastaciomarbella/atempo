import React, { useEffect, useState } from "react";
import "./header.css";
import { API_URL } from "../../config";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");
  const [logo, setLogo] = useState(null);

  // Función para obtener URL segura
  const getSafeLogoUrl = (logoUrl) => {
    if (!logoUrl || logoUrl === "null" || logoUrl.trim() === "") {
      console.log("Logo vacío o null, se usará placeholder");
      return null;
    }

    // Absoluta: forzar HTTPS
    if (/^https?:\/\//i.test(logoUrl)) {
      const httpsUrl = logoUrl.replace(/^http:\/\//i, "https://");
      console.log("Logo absoluto convertido a HTTPS:", httpsUrl);
      return httpsUrl;
    }

    // Relativa: agregar API_URL
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

        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");
        setLogo(getSafeLogoUrl(parsedUser.logo_url));
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
              console.log("Error cargando la imagen del logo:", e.target.src);
              e.target.onerror = null;
              e.target.src = null; // mostrar placeholder
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