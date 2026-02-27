import React, { useState, useEffect } from "react";
import "../styles/agendaDiaria.css";
import ModalCita from "../components/modalCita/modalCita";
import { API_URL } from "../config";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const AgendaDiaria = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem("token"); // tu token
        const res = await fetch(`${API_URL}/citas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCitas(data);
        console.log("📄 Datos recibidos:", data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCitas();
  }, []);

  // Filtrar citas del día
  const citasDelDia = citas.filter(
    (cita) => cita.fecha === fechaActual.toISOString().split("T")[0]
  );
  console.log("📌 Citas del día:", citasDelDia);

  // Función para abrir modal
  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setModalVisible(true);
  };

  return (
    <div className="calendar-container">
      <div className="top-bar">
        <h2>Agenda del día: {fechaActual.toLocaleDateString()}</h2>
      </div>

      <div className="day-grid">
        {[...Array(24).keys()].map((hora) => {
          const bloques = citasDelDia.filter((cita) => {
            // Convertir fechas y horas a objetos Date completos
            const inicio = new Date(`${cita.fecha}T${cita.hora_inicio}`);
            const fin = new Date(`${cita.fecha}T${cita.hora_final}`);
            const bloqueHora = new Date(fechaActual);
            bloqueHora.setHours(hora, 0, 0, 0);

            // match si la hora del bloque intersecta con la cita
            const match = bloqueHora >= inicio && bloqueHora < fin;
            if (match) console.log(`🕒 Hora ${hora}: cita "${cita.titulo}" → match=${match}`);
            return match;
          });

          return (
            <div key={hora} className="hour-block">
              <span className="hour-label">{hora}:00</span>
              {bloques.map((cita) => (
                <div
                  key={cita.id}
                  className="cita"
                  onClick={() => abrirModal(cita)}
                  style={{ backgroundColor: cita.color || "#f16b74" }}
                >
                  {cita.titulo} ({cita.hora_inicio} - {cita.hora_final})
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {modalVisible && (
        <ModalCita
          cita={citaSeleccionada}
          cerrar={() => setModalVisible(false)}
          refrescar={() => {
            setModalVisible(false);
            // refrescar lista de citas
            setCitas([...citas]);
          }}
        />
      )}
    </div>
  );
};

export default AgendaDiaria;