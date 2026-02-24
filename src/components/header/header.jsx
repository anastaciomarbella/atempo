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

        // ✅ Usar los nombres reales que manda el backend
        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");

        if (parsedUser.logo_url) {
          // 🔥 Si viene con http lo convertimos a https
          if (parsedUser.logo_url.startsWith("http")) {
            setLogo(
              parsedUser.logo_url.replace("http://", "https://")
            );
          } else {
            setLogo(`${API_URL}/${parsedUser.logo_url}`);
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