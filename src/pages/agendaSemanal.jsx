import React, { useState, useEffect } from 'react';
import '../styles/agendaSemanal.css';
import avatar from '../assets/avatar.png';
import { FaClock } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaSemanal = () => {
  const [personas, setPersonas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
  const alturaHora = 62; // altura de cada celda de hora
  const alturaCita = 50; // altura uniforme de cada cita dentro de la celda

  // Cambiar semana
  const cambiarSemana = dias => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  // Cargar primeros 4 empleados
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data.slice(0, 4));
      } catch (error) {
        console.error('Error cargando personas:', error);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas de la semana
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/citas`);
        const data = await res.json();

        const inicioSemana = new Date(fechaSeleccionada);
        inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay() + 1); // lunes
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6); // domingo

        const citasSemana = data.filter(cita => {
          const citaFecha = new Date(cita.fecha);
          return citaFecha >= inicioSemana && citaFecha <= finSemana;
        });

        setCitas(citasSemana);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [API_URL, fechaSeleccionada]);

  const actualizarCita = citaEditada => {
    setCitas(prev => {
      if (citaEditada.eliminar) {
        return prev.filter(c => c.id_cita !== citaEditada.id_cita);
      }
      const index = prev.findIndex(c => c.id_cita === citaEditada.id_cita);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = citaEditada;
        return updated;
      } else {
        return [...prev, citaEditada];
      }
    });
    setCitaSeleccionada(null);
  };

  // Calcular inicio y fin de semana para mostrar en header
  const inicioSemana = new Date(fechaSeleccionada);
  inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay() + 1); // lunes
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6); // domingo

  return (
    <main className="weekly-agenda-main">
      {/* Header con flechas y rango de semana */}
      <div
        className="agenda-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
      >
        <button className="date-nav-btn" onClick={() => cambiarSemana(-7)}>
          <FiChevronLeft size={20} />
        </button>

        <span style={{ fontWeight: 'bold' }}>
          Semana del {inicioSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}  
          al {finSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>

        <button className="date-nav-btn" onClick={() => cambiarSemana(7)}>
          <FiChevronRight size={20} />
        </button>
      </div>

      <div
        className="agenda-grid"
        style={{ gridTemplateColumns: `80px repeat(${personas.length}, 1fr)` }}
      >
        {/* Columna de horas */}
        <div className="weekly-clock-header">
          <FaClock />
        </div>

        {/* Header: avatares y nombres */}
        {personas.map(p => (
          <div className="employee-header" key={p.id}>
            <img
              src={avatar}
              alt={p.nombre}
              className="person-avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '4px' }}
            />
            <span className="person-name">{p.nombre}</span>
          </div>
        ))}

        {/* Filas por hora */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {personas.map(persona => {
              // Filtrar solo citas que inicien en esta hora
              const citasPersona = citas.filter(
                cita =>
                  cita.id_persona === persona.id &&
                  cita.hora_inicio.slice(0, 2) === hour.slice(0, 2)
              );

              return (
                <div
                  className="time-cell"
                  key={`${persona.id}-${hour}`}
                  style={{ position: 'relative', height: `${alturaHora}px`, padding: '2px' }}
                >
                  {citasPersona.map(cita => (
                    <div
                      key={cita.id_cita}
                      className="appointment"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        height: `${alturaCita}px`,
                        backgroundColor: cita.color || '#a0c4ff',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#000',
                        fontSize: '12px',
                        overflow: 'hidden',
                        width: '90%',
                        left: '5%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}
                      onClick={() => setCitaSeleccionada(cita)}
                    >
                      <strong>{cita.nombre_cliente || cita.client}</strong>
                      <div>{cita.titulo || cita.service}</div>
                      <small>
                        {cita.hora_inicio} - {cita.hora_final}
                      </small>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {citaSeleccionada && (
        <ModalCita
          modo="editar"
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onSave={actualizarCita}
        />
      )}
    </main>
  );
};

export default AgendaSemanal;
