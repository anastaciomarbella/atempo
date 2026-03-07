import React from "react";
import "./header.css";

const Header = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const nombreEmpresa = user.nombre_empresa || "Mi Empresa";

  return (
    <div className="header">
      <div className="empresa-container">
        <h2>{nombreEmpresa}</h2>
      </div>
    </div>
  );

};

export default Header;