import React, { useEffect, useState } from 'react';
import './header.css';

const Header = () => {
  const [empresa, setEmpresa] = useState("Mi Empresa");

  useEffect(() => {
    const empresaGuardada = localStorage.getItem("empresa");
    if (empresaGuardada && empresaGuardada !== "undefined") {
      setEmpresa(empresaGuardada);
    }
  }, []);

  return (
    <header className="top-header">
      <h1 className="business-name">
        {empresa}
      </h1>
    </header>
  );
};

export default Header;