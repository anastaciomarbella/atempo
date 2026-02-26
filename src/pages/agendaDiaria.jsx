import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";

const HORAS_DIA = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usuarioLogueado = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // ==============================
  // Fetch citas del usuario
  // ==============================
  const fetchCitas = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!usuarioLogueado?.id_usuario || !token) {
        setCitas([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("No se pudieron cargar las citas.");
        setLoading(false);
        return;
      }

      let data = await res.json();
      if (!Array.isArray(data)) data = [];

      // ✅ Filtrar solo citas del usuario
      const citasUsuario = data.filter(c => c.id_usuario === usuarioLogueado.id_usuario);

      // ✅ Filtrar solo las de la fecha actual
      const citasHoy = citasUsuario.filter(c => {
        const f = new Date(c.fecha);
        return (
          f.getFullYear() === fechaActual.getFullYear() &&
          f.getMonth() === fechaActual.getMonth() &&
          f.getDate() === fechaActual.getDate()
        );
      });

      setCitas(citasHoy);

    } catch (err) {
      console.error("Error fetch citas:", err);
      setError("No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [fechaActual]);

  // ==============================
  // Cambiar día
  // ==============================
  const cambiarDia = (delta) => {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + delta);
    setFechaActual(nueva);
  };

  // ==============================
  // Convertir hora a posición vertical
  // ==============================
  const convertirAHoras = (hora) => {
    const [h, m] = hora.split(":").map(Number);
    return h + m / 60;
  };

  const calcularEstiloCita = (cita) => {
    const inicio = convertirAHoras(cita.hora_inicio);
    const fin = convertirAHoras(cita.hora_final);

    return {
      position: "absolute",
      top: `${(inicio - 7) * 60}px`, // 7am es top=0
      height: `${(fin - inicio) * 60}px`,
      width: "95%",
      left: "2.5%",
      backgroundColor: cita.color || "rgba(47,128,237,0.3)",
      borderRadius: "6px",
      padding: "4px",
      cursor: "pointer",
    };
  };

  return (
    <main className="calendar-container">
      {/* ============================== */}
      {/* Barra superior */}
      {/* ============================== */}
      <div className="top-bar">
        <button onClick={() => cambiarDia(-1)}>◀</button>
        <span className="day-title">
          {fechaActual.toLocaleDateString("es-MX", { 
            weekday: "long", day: "numeric", month: "long", year: "numeric" 
          })}
        </span>
        <button onClick={() => cambiarDia(1)}>▶</button>

        {usuarioLogueado?.nombre_empresa && (
          <div className="empresa-info">
            Empresa: {usuarioLogueado.nombre_empresa}
          </div>
        )}
      </div>

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* ============================== */}
      {/* Grilla horaria */}
      {/* ============================== */}
      <div className="day-grid">
        {HORAS_DIA.map(hora => (
          <div key={hora} className="hour-cell" style={{ position: "relative" }}>
            <div className="hour-label">{hora}:00</div>

            {citas.map(cita => (
              <div key={cita.id_cita} className="event-card" style={calcularEstiloCita(cita)}>
                <strong>{cita.titulo}</strong>
                <div>{cita.hora_inicio.slice(0,5)} - {cita.hora_final.slice(0,5)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
};

export default AgendaDiaria;