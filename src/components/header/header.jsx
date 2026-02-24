import React, { useEffect, useState } from 'react';
import './header.css';

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");

  useEffect(() => {
    // 🔹 Leer usuario desde localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setEmpresa(parsedUser.empresaNombre || "Mi Empresa");
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }
  }, []);

  return (
    <header className="top-header">
      <h1 className="business-name">{empresa}</h1>
    </header>
  );
};

export default Header;