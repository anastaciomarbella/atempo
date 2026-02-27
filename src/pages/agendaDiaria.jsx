import React, { useEffect, useState } from "react";
import "../styles/agendaDiaria.css";
import { API_URL } from "../config";
import ModalCita from "../components/modalCita/modalCita";

// Horas visibles de la agenda (7am a 23pm)
const HORAS_DIA = Array.from({ length: 17 }, (_, i) => i + 7);

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const token = localStorage.getItem("token");

  // ==============================
  // OBTENER CITAS
  // ==============================
  const fetchCitas = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        setCitas([]);
        return;
      }

      // Filtrar por día actual
      const citasDelDia = data.filter(cita => {
        if (!cita.fecha) return false;

        const [y, m, d] = cita.fecha.split("-");
        const fechaCita = new Date(y, m - 1, d);

        return (
          fechaCita.getFullYear() === fechaActual.getFullYear() &&
          fechaCita.getMonth() === fechaActual.getMonth() &&
          fechaCita.getDate() === fechaActual.getDate()
        );
      });

      setCitas(citasDelDia);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCitas();
  }, [fechaActual, token]);

  // ==============================
  // CAMBIAR DÍA
  // ==============================
  const cambiarDia = delta => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaActual(nuevaFecha);
  };

  // ==============================
  // CALCULAR POSICIÓN Y ALTURA
  // ==============================
  const calcularEstiloCita = cita => {
    if (!cita.hora_inicio || !cita.hora_final)
      return { top: 0, height: 0 };

    const [hi, mi] = cita.hora_inicio.split(":").map(Number);
    const [hf, mf] = cita.hora_final.split(":").map(Number);

    const duracionMinutos =
      (hf * 60 + mf) - (hi * 60 + mi);

    return {
      top: mi, // 1px = 1 minuto
      height: duracionMinutos
    };
  };

  // ==============================
  // MOSTRAR SOLO EN HORA INICIAL
  // ==============================
  const citasPorHora = hora => {
    return citas.filter(cita => {
      if (!cita.hora_inicio) return false;
      const [hi] = cita.hora_inicio.split(":").map(Number);
      return hora === hi;
    });
  };

  // ==============================
  // MODAL
  // ==============================
  const abrirModal = cita => {
    setCitaSeleccionada(cita);
  };

  const cerrarModal = () => {
    setCitaSeleccionada(null);
  };

  const guardarYCerrar = () => {
    cerrarModal();
    fetchCitas();
  };

  // ==============================
  // RENDER
  // ==============================
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
                  key={cita.id}
                  className="event-card"
                  onClick={() => abrirModal(cita)}
                  style={{
                    backgroundColor: cita.color || "#cfe2ff",
                    position: "absolute",
                    top: `${estilo.top}px`,
                    height: `${estilo.height}px`,
                    width: "95%",
                    cursor: "pointer"
                  }}
                >
                  <strong>{cita.titulo || "Sin título"}</strong>
                  <div style={{ fontSize: 11 }}>
                    {cita.hora_inicio?.slice(0, 5)} –{" "}
                    {cita.hora_final?.slice(0, 5)}
                  </div>
                  {cita.nombre_cliente && (
                    <div style={{ fontSize: 11 }}>
                      {cita.nombre_cliente}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {citaSeleccionada && (
        <ModalCita
          cita={citaSeleccionada}
          onClose={cerrarModal}
          onSave={guardarYCerrar}
        />
      )}
    </main>
  );
};

export default AgendaDiaria;