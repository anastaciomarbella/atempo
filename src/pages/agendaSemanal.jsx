import React, { useEffect, useState } from "react";
import "../styles/agendaSemanal.css";
import { API_URL } from "../config";
import ModalCita from "../components/modalCita/modalCita";

const HORAS = Array.from({ length: 17 }, (_, i) => i + 7); // 7am - 23pm

const AgendaSemanal = () => {
  const [fechaBase, setFechaBase] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= OBTENER LUNES DE LA SEMANA =================
  const obtenerInicioSemana = (fecha) => {
    const nueva = new Date(fecha);
    const dia = nueva.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    nueva.setDate(nueva.getDate() + diferencia);
    nueva.setHours(0, 0, 0, 0);
    return nueva;
  };

  const inicioSemana = obtenerInicioSemana(fechaBase);

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    return dia;
  });

  // ================= FETCH =================
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

      setCitas(data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCitas();
  }, [fechaBase, token]);

  // ================= FILTRAR CITA POR DÍA Y HORA =================
  const obtenerCita = (fecha, hora) => {
    return citas.find((cita) => {
      if (!cita.fecha || !cita.hora_inicio) return false;

      const [y, m, d] = cita.fecha.split("-");
      const fechaCita = new Date(y, m - 1, d);

      const [hi] = cita.hora_inicio.split(":").map(Number);

      return (
        fechaCita.getFullYear() === fecha.getFullYear() &&
        fechaCita.getMonth() === fecha.getMonth() &&
        fechaCita.getDate() === fecha.getDate() &&
        hi === hora
      );
    });
  };

  // ================= CAMBIAR SEMANA =================
  const cambiarSemana = (delta) => {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() + delta * 7);
    setFechaBase(nueva);
  };

  // ================= MODAL =================
  const abrirModal = (cita) => setCitaSeleccionada(cita);
  const cerrarModal = () => setCitaSeleccionada(null);

  const guardarYCerrar = () => {
    cerrarModal();
    fetchCitas();
  };

  return (
    <main className="calendar-container">
      <div className="top-bar">
        <button onClick={() => cambiarSemana(-1)}>◀</button>
        <strong>
          Semana del{" "}
          {inicioSemana.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
          })}
        </strong>
        <button onClick={() => cambiarSemana(1)}>▶</button>
      </div>

      {loading && <p>Cargando citas...</p>}

      <div className="calendar-grid">
        {/* Encabezados */}
        <div className="hour-header"></div>
        {diasSemana.map((dia, i) => (
          <div key={i} className="day-header">
            {dia.toLocaleDateString("es-MX", {
              weekday: "short",
              day: "numeric",
            })}
          </div>
        ))}

        {/* Filas por hora */}
        {HORAS.map((hora) => (
          <React.Fragment key={hora}>
            <div className="hour-label">{hora}:00</div>

            {diasSemana.map((dia, index) => {
              const cita = obtenerCita(dia, hora);

              return (
                <div key={index} className="calendar-cell">
                  {cita && (
                    <div
                      className="event-card"
                      style={{ backgroundColor: cita.color || "#cfe2ff" }}
                      onClick={() => abrirModal(cita)}
                    >
                      <strong>{cita.titulo || "Sin título"}</strong>
                      <div>
                        {cita.hora_inicio?.slice(0, 5)} -{" "}
                        {cita.hora_final?.slice(0, 5)}
                      </div>
                      {cita.nombre_cliente && (
                        <div>{cita.nombre_cliente}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
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

export default AgendaSemanal;