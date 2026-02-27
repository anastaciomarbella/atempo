import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

// Horas visibles de la agenda (7am a 23pm)
const HORAS_DIA = Array.from({ length: 17 }, (_, i) => i + 7); 

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  console.log("🔹 Token actual:", token);
  console.log("🔹 Fecha inicial:", fechaActual);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      console.log("⏳ Iniciando fetch de citas...");

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("📄 Datos recibidos:", data);

      if (!Array.isArray(data)) return setCitas([]);

      // Filtrar citas del día actual
      const citasDelDia = data.filter(cita => {
        if (!cita.fecha) return false;

        const [y, m, d] = cita.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);

        const isSameDay =
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth() === fechaActual.getMonth() &&
          fechaCita.getDate() === fechaActual.getDate();

        if (!isSameDay) console.log("❌ Cita no es del día:", cita);
        else console.log("✅ Cita filtrada:", cita);

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
    console.log("🔄 useEffect disparado: fechaActual o token cambió");
    if (token) fetchCitas();
    else {
      console.warn("⚠️ No hay token, no se hace fetch de citas");
      setCitas([]);
      setLoading(false);
    }
  }, [fechaActual, token]);

  // Cambiar día
  const cambiarDia = delta => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    console.log("🔄 Cambiando día a:", nueva);
    setFechaActual(nueva);
  };

  // Calcular posición y altura de cada cita dentro de la celda
  const calcularEstiloCita = cita => {
    if (!cita.hora_inicio || !cita.hora_final) return { top: 0, height: 0 };

    const [hi, mi] = cita.hora_inicio.split(":").map(Number);
    const [hf, mf] = cita.hora_final.split(":").map(Number);

    const startMinutes = mi;
    const endMinutesTotal = (hf - hi) * 60 + mf - mi;

    // Cada celda tiene min-height 60px → 1px = 1 minuto
    const top = startMinutes; // px desde inicio de la celda
    const height = endMinutesTotal; // px de altura

    return { top, height };
  };

  // Filtrar citas que estén activas en la hora
  const citasPorHora = hora => {
    return citas.filter(cita => {
      if (!cita.hora_inicio || !cita.hora_final) return false;
      const [hi] = cita.hora_inicio.split(":").map(Number);
      const [hf] = cita.hora_final.split(":").map(Number);
      const match = hora >= hi && hora <= hf;
      console.log(`🕒 Hora ${hora}: cita "${cita.titulo}" → match=${match}`);
      return match;
    });
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

            {citasPorHora(hora).map(cita => {
              const estilo = calcularEstiloCita(cita);
              return (
                <div
                  key={cita.id || Math.random()}
                  className="event-card"
                  style={{
                    backgroundColor: cita.color || "#cfe2ff",
                    position: "absolute",
                    top: `${estilo.top}px`,
                    height: `${estilo.height}px`,
                    width: "95%",
                  }}
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
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;