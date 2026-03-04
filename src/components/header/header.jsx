import React, { useEffect, useState } from "react";
import "./header.css";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Usuario desde localStorage:", parsedUser);

        setEmpresa(parsedUser.nombre_empresa || "Mi Empresa");
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
        <div className="logo-placeholder">
          {empresa.charAt(0).toUpperCase()}
        </div>
        <h1 className="business-name">{empresa}</h1>
      </div>
    </header>
  );
};

export default Header;