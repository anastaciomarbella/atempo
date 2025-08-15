import React, { useState, useEffect } from 'react';
import '../styles/agendaSemanal.css';
import avatar from '../assets/avatar.png';
import { FaClock } from 'react-icons/fa';
import ModalCita from '../components/modalCita/modalCita';

const AgendaSemanal = () => {
  const [personas, setPersonas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
  const alturaHora = 62; // altura de cada hora en px
  const pxPorMinuto = alturaHora / 60;

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

  // Cargar todas las citas
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/citas`);
        const data = await res.json();
        setCitas(data);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [API_URL]);

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

  const horaAMinutos = hora => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <main className="weekly-agenda-main">
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
              const citasPersona = citas.filter(
                cita =>
                  cita.id_persona === persona.id &&
                  horaAMinutos(cita.hora_inicio) < horaAMinutos(hour) + 60 &&
                  horaAMinutos(cita.hora_final) > horaAMinutos(hour)
              );

              return (
                <div
                  className="time-cell"
                  key={`${persona.id}-${hour}`}
                  style={{ position: 'relative', height: `${alturaHora}px`, padding: '2px' }}
                >
                  {citasPersona.map(cita => {
                    const startMin = Math.max(horaAMinutos(cita.hora_inicio), horaAMinutos(hour));
                    const endMin = Math.min(horaAMinutos(cita.hora_final), horaAMinutos(hour) + 60);
                    const offset = startMin - horaAMinutos(hour);
                    const height = endMin - startMin;

                    return (
                      <div
                        key={cita.id_cita}
                        className="appointment"
                        style={{
                          position: 'absolute',
                          top: `${offset * pxPorMinuto}px`,
                          height: `${height * pxPorMinuto}px`,
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
                    );
                  })}
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
