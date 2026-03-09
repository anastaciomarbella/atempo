/* ============================================================
   NotificationBell.jsx
   Campana de notificaciones para agregar al Sidebar
   ============================================================ */

import React from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import usePushNotifications from "./usePushNotifications";

const estilos = {
  wrapper: {
    width: "100%",
    marginBottom: "4px",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid transparent",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    color: "#94a3b8",
  },
  btnActivo: {
    background: "rgba(167,139,250,0.12)",
    color: "#e2e8f0",
    borderColor: "rgba(167,139,250,0.2)",
  },
  icon: { fontSize: "17px" },
  badge: {
    marginLeft: "auto",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px rgba(34,197,94,0.7)",
  },
  error: {
    fontSize: "11px",
    color: "#f87171",
    padding: "4px 14px 8px",
    lineHeight: "1.4",
  },
};

const NotificationBell = () => {
  const { suscripcion, permiso, error, cargando, suscribirse, desuscribirse } =
    usePushNotifications();

  const activo = !!suscripcion && permiso === "granted";

  const handleClick = () => {
    if (activo) {
      desuscribirse();
    } else {
      suscribirse();
    }
  };

  return (
    <div style={estilos.wrapper}>
      <button
        type="button"
        onClick={handleClick}
        disabled={cargando || permiso === "denied"}
        style={{
          ...estilos.btn,
          ...(activo ? estilos.btnActivo : {}),
          opacity: cargando ? 0.6 : 1,
        }}
        title={
          permiso === "denied"
            ? "Notificaciones bloqueadas en el navegador"
            : activo
            ? "Desactivar notificaciones"
            : "Activar notificaciones"
        }
      >
        {activo ? (
          <FaBell style={{ ...estilos.icon, color: "#a78bfa" }} />
        ) : (
          <FaBellSlash style={estilos.icon} />
        )}

        {cargando
          ? "Activando..."
          : activo
          ? "Notificaciones ON"
          : permiso === "denied"
          ? "Notificaciones bloqueadas"
          : "Activar notificaciones"}

        {activo && <span style={estilos.badge} title="Activo" />}
      </button>

      {error && <p style={estilos.error}>{error}</p>}
    </div>
  );
};

export default NotificationBell;
