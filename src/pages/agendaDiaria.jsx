import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const HORAS_DIA = Array.from({ length: 17 }, (_, i) => i + 7); // 7 a 23

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  console.log("🔹 Token:", token);
  console.log("🔹 Fecha inicial:", fechaActual);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      console.log("⏳ Fetch citas...");

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("📄 Datos recibidos:", data);

      if (!Array.isArray(data)) return setCitas([]);

      // Filtrar citas del día
      const citasDelDia = data.filter(cita => {
        if (!cita.fecha) return false;
        const [y, m, d] = cita.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);
        const isSameDay =
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth() === fechaActual.getMonth() &&
          fechaCita.getDate() === fechaActual.getDate();
        if (isSameDay) console.log("✅ Cita filtrada:", cita);
        return isSameDay;
      });

      setCitas(citasDelDia);
      console.log("📌 Citas del día:", citasDelDia);
    } catch (err) {
      console.error("❌ Error fetch citas:", err);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCitas();
    else setCitas([]);
  }, [fechaActual, token]);

  const cambiarDia = delta => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    console.log("🔄 Cambiando día a:", nueva);
    setFechaActual(nueva);
  };

  // Retorna todas las porciones de la cita que caen en la hora actual
  const citasPorHora = hora => {
    return citas
      .map(cita => {
        const [hi, mi] = cita.hora_inicio.split(":").map(Number);
        const [hf, mf] = cita.hora_final.split(":").map(Number);

        // Si la cita no está en esta hora, ignorar
        if (hora < hi || hora > hf) return null;

        let top = 0;
        let height = 0;

        if (hora === hi && hora === hf) {
          // cita dentro de la misma hora
          top = mi;
          height = mf - mi;
        } else if (hora === hi) {
          // primera hora de la cita
          top = mi;
          height = 60 - mi;
        } else if (hora === hf) {
          // última hora de la cita
          top = 0;
          height = mf;
        } else {
          // hora intermedia
          top = 0;
          height = 60;
        }

        return { ...cita, top, height };
      })
      .filter(cita => cita !== null);
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

            {citasPorHora(hora).map(cita => (
              <div
                key={cita.id || Math.random()}
                className="event-card"
                style={{
                  backgroundColor: cita.color || "#cfe2ff",
                  position: "absolute",
                  top: `${cita.top}px`,
                  height: `${cita.height}px`,
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
            ))}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;