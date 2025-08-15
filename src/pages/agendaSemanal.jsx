import React, { useState, useEffect, useMemo } from 'react';
import '../styles/agendaDiaria.css';
import avatar from '../assets/avatar.png';
import { FaClock, FaChevronDown } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaSemanal = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('todos');
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Calcular inicio de semana (lunes)
  const fechaInicioSemana = useMemo(() => {
    const d = new Date(fechaSeleccionada);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [fechaSeleccionada]);

  // Array de días de la semana
  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(fechaInicioSemana);
      date.setDate(fechaInicioSemana.getDate() + i);
      return {
        id: i + 1,
        label: date.toLocaleDateString('es-MX', { weekday: 'short' }),
        date,
        dateStr: date.toISOString().slice(0, 10),
      };
    });
  }, [fechaInicioSemana]);

  const hours = Array.from({ length: 8 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`);

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error cargando personas:', error);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas según persona y semana
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let url = `${API_URL}/api/citas`;
        if (personaSeleccionada !== 'todos') {
          url = `${API_URL}/api/citas/persona/${personaSeleccionada}`;
        }
        const res = await fetch(url);
        const data = await res.json();

        const citasFiltradas = data.filter(cita => {
          const citaFecha = new Date(cita.fecha);
          return citaFecha >= diasSemana[0].date && citaFecha <= diasSemana[6].date;
        });

        setCitas(prev => {
          const citasUnicas = [...prev];
          citasFiltradas.forEach(nuevaCita => {
            const index = citasUnicas.findIndex(c => c.id_cita === nuevaCita.id_cita);
            if (index !== -1) {
              citasUnicas[index] = nuevaCita;
            } else {
              citasUnicas.push(nuevaCita);
            }
          });
          return citasUnicas;
        });
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, diasSemana, API_URL]);

  const cambiarFecha = dias => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const actualizarCita = citaEditada => {
    setCitas(prev => {
      if (citaEditada.eliminar) {
        return prev.filter(c => c.id_cita !== citaEditada.id_cita);
      }
      const existe = prev.some(c => c.id_cita === citaEditada.id_cita);
      if (existe) {
        return prev.map(c => (c.id_cita === citaEditada.id_cita ? citaEditada : c));
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
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-7)}>
            <FiChevronLeft />
          </button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(7)}>
            <FiChevronRight />
          </button>
          <span>
            Del {diasSemana[0].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} al{' '}
            {diasSemana[6].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <select
          className="filter-select"
          value={personaSeleccionada}
          onChange={e => setPersonaSeleccionada(e.target.value)}
        >
          <option value="todos">Todos</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div
        className="agenda-grid"
        style={{ gridTemplateColumns: `80px repeat(${personas.length}, 1fr)` }}
      >
        {/* Columna de reloj */}
        <div className="weekly-clock-header">
          <button className="weekly-clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {/* Avatares y nombres de empleados */}
        {personas.map(p => (
          <div className="employee-header" key={p.id}>
            <img src={avatar} alt={p.nombre} className="person-avatar" />
            <span className="person-name">{p.nombre}</span>
          </div>
        ))}

        {/* Fila de días debajo de la cabecera */}
        {diasSemana.map(day => (
          <div
            className="day-agenda-header"
            key={day.id}
            style={{
              gridColumn: `2 / ${personas.length + 2}`,
              display: 'flex',
              justifyContent: 'space-around',
              fontWeight: '600',
              padding: '4px 0',
              borderBottom: '2px solid #e5e7eb'
            }}
          >
            {personas.map(p => (
              <div key={p.id} style={{ textAlign: 'center', width: '100%' }}>
                {day.label} {day.date.getDate()}/{day.date.getMonth() + 1}
              </div>
            ))}
          </div>
        ))}

        {/* Filas de horas */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {personas.map(persona => {
              const citasPersona = citas.filter(cita => {
                return cita.id_persona === persona.id;
              });

              return (
                <div className="time-cell" key={`${persona.id}-${hour}`} style={{ position: 'relative' }}>
                  {citasPersona.map(cita => {
                    const [startH, startM] = cita.hora_inicio.split(':').map(Number);
                    const [endH, endM] = cita.hora_final.split(':').map(Number);
                    const startTotal = startH * 60 + startM;
                    const endTotal = endH * 60 + endM;
                    const cellStart = parseInt(hour.split(':')[0], 10) * 60;
                    const offset = startTotal - cellStart;
                    const height = ((endTotal - startTotal) / 60) * 62;
                    const top = (offset / 60) * 62;

                    return (
                      <div
                        className="appointment"
                        key={cita.id_cita}
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: cita.color || '#a0c4ff',
                          borderRadius: '6px',
                          padding: '4px',
                          marginBottom: '2px',
                          cursor: 'pointer',
                          color: '#000',
                          fontSize: '12px',
                          overflow: 'hidden',
                          width: '90%',
                          left: '5%',
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
