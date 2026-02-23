import React, { useEffect, useState } from 'react';
import './header.css';

const Header = () => {
  const [empresa, setEmpresa] = useState("");

  useEffect(() => {
    const empresaGuardada = localStorage.getItem("empresa");
    if (empresaGuardada) {
      setEmpresa(empresaGuardada);
    }
  }, []);

  return (
    <header className="top-header">
      <h1 className="business-name">
        {empresa || "Mi Empresa"}
      </h1>
    </header>
  );
};

export default Header;