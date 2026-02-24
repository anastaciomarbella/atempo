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

        setEmpresa(parsedUser.empresaNombre || "Mi Empresa");

        // 🔥 Manejar logo correctamente
        if (parsedUser.empresaLogo) {
          // Si viene como ruta relativa (/uploads/logo.png)
          if (parsedUser.empresaLogo.startsWith("/")) {
            setLogo(
              `https://mi-api-atempo.onrender.com${parsedUser.empresaLogo}`
            );
          } else {
            // Si ya viene como URL completa
            setLogo(parsedUser.empresaLogo);
          }
        }
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }
  }, []);

  return (
    <header className="top-header">
      <div className="empresa-container">
        {logo && (
          <img
            src={logo}
            alt="Logo empresa"
            className="empresa-logo"
          />
        )}
        <h1 className="business-name">{empresa}</h1>
      </div>
    </header>
  );
};

export default Header;