import React, { useEffect, useState } from "react";
import "./header.css";

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");

  console.log("🟢 Header renderizado");
  console.log("📌 Estado actual empresa:", empresa);

  useEffect(() => {
    console.log("🟡 useEffect Header ejecutado");

    const storedUser = localStorage.getItem("user");
    console.log("📦 Contenido raw localStorage user:", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ Usuario parseado correctamente:", parsedUser);
        console.log("🏢 nombre_empresa:", parsedUser?.nombre_empresa);

        if (!parsedUser?.nombre_empresa) {
          console.warn("⚠️ nombre_empresa viene vacío o undefined");
        }

        setEmpresa(parsedUser?.nombre_empresa || "Mi Empresa");

      } catch (error) {
        console.error("❌ Error leyendo usuario:", error);
      }
    } else {
      console.warn("⚠️ No hay usuario en localStorage");
    }
  }, []);

  return (
    <header className="top-header">
      {console.log("🎯 Render del return Header ejecutado")}

      <div className="empresa-container">
        <div className="logo-placeholder">
          {empresa ? empresa.charAt(0).toUpperCase() : "?"}
        </div>
        <h1 className="business-name">
          {empresa || "Mi Empresa"}
        </h1>
      </div>
    </header>
  );
};

export default Header;