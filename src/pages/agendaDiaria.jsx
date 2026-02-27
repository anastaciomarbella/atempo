import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7);

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  console.log("🔹 Token actual:", token);
  console.log("🔹 Fecha actual:", fechaActual);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      console.log("⏳ Iniciando fetch de citas...");

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📡 Respuesta fetch:", res);

      const data = await res.json();
      console.log("📄 Datos recibidos:", data);

      if (!Array.isArray(data)) {
        console.warn("⚠️ Data no es array:", data);
        return setCitas([]);
      }

      // Filtrar citas del día
      const citasDelDia = data.filter(c => {
        if (!c.fecha) {
          console.warn("⚠️ Cita sin fecha:", c);
          return false;
        }

        const [y, m, d] = c.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);

        const isSameDay =
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth() === fechaActual.getMonth() &&
          fechaCita.getDate() === fechaActual.getDate();

        if (!isSameDay) {
          console.log("❌ Cita no es del día:", c.fecha, "vs", fechaActual);
        } else {
          console.log("✅ Cita filtrada:", c.fecha);
        }

        return isSameDay;
      });

      console.log("📌 Citas del día:", citasDelDia);
      setCitas(citasDelDia);
    } catch (err) {
      console.error("❌ Error fetch citas:", err);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect disparado, fechaActual o token cambió");
    if (token) {
      fetchCitas();
      return;
    }
    console.warn("⚠️ No hay token, no se hace fetch de citas");
    setCitas([]);
    setLoading(false);
  }, [fechaActual, token]);

  const cambiarDia = delta => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    console.log("🔄 Cambiando día a:", nueva);
    setFechaActual(nueva);
  };

  // Función para obtener citas aunque no sean exactas a la hora
  const citasPorHora = hora => {
    const filtradas = citas.filter(cita => {
      if (!cita.hora_inicio) {
        console.warn("⚠️ Cita sin hora_inicio:", cita);
        return false;
      }
      const [h] = cita.hora_inicio.split(":");
      const match = parseInt(h) === hora;
      if (!match) console.log(`❌ Cita ${cita.titulo} no coincide con hora ${hora}`);
      else console.log(`✅ Cita ${cita.titulo} coincide con hora ${hora}`);
      return match;
    });

    console.log(`🕒 Citas de la hora ${hora}:`, filtradas);
    return filtradas;
  };

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <button onClick={() => cambiarDia(-1)}>◀</button>
        <strong>
          {fechaActual.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </strong>
        <button onClick={() => cambiarDia(1)}>▶</button>
      </div>

      {loading && <p>Cargando citas...</p>}

      <div className="agenda-wrapper">
        {HORAS_DIA.map(hora => (
          <div key={hora} className="hour-cell">
            <div className="hour-label">{hora}:00</div>

            {/* Mostrar todas las citas de esta hora */}
            {citasPorHora(hora).map(cita => (
              <div
                key={cita.id_cita || Math.random()} // seguridad por si id_cita falta
                className="event-card"
                style={{ backgroundColor: cita.color || "#cfe2ff" }}
              >
                <strong>{cita.titulo || "Sin título"}</strong>
                <div style={{ fontSize: 11 }}>
                  {cita.hora_inicio?.slice(0, 5) || "--:--"} –{" "}
                  {cita.hora_final?.slice(0, 5) || "--:--"}
                </div>
                {cita.nombre_cliente && (
                  <div style={{ fontSize: 11 }}>{cita.nombre_cliente}</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;