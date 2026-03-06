import React, { useEffect, useState } from "react";
import "./header.css";
import { API_URL } from "../../config/api";

const Header = () => {

  const [empresa, setEmpresa] = useState({
    nombre: "",
    logo: ""
  });

  useEffect(() => {
    obtenerEmpresa();
  }, []);

  const obtenerEmpresa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresa`);
      const data = await res.json();

      if (data && data.length > 0) {
        setEmpresa(data[0]);
      }

    } catch (error) {
      console.error("Error cargando empresa:", error);
    }
  };

  return (
    <div className="header">

      <div className="empresa-container">

        <img
          src={
            empresa.logo
              ? `${API_URL}/uploads/${empresa.logo}`
              : "/logo-default.png"
          }
          alt="Logo empresa"
          className="empresa-logo-header"
        />

        <h2>{empresa.nombre}</h2>

      </div>

    </div>
  );
};

export default Header;