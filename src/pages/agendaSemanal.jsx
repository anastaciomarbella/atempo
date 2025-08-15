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
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Inicio de semana (lunes)
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

  // Horas
  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  // Cargar personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/personas`);
        const data = await res.json();
        setPersonas(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPersonas();
  }, [API_URL]);

  // Cargar citas
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let url = `${API_URL}/api/citas`;
        if (personaSeleccionada !== 'todos') url += `?id_persona=${personaSeleccionada}`;
        const res = await fetch(url);
        const data = await res.json();

        // Filtrar citas de la semana
        const citasSemana = data.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= diasSemana[0].date && fechaCita <= diasSemana[6].date;
        });
        setCitas(citasSemana);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, diasSemana, API_URL]);

  const cambiarFecha = dias => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const empleadosAMostrar = useMemo(() => {
    return personaSeleccionada === 'todos'
      ? personas
      : [personas.find(p => p.id === Number(personaSeleccionada))].filter(Boolean);
  }, [personaSeleccionada, personas]);

  const horaAMinutos = hora => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  const actualizarCita = citaEditada => {
    setCitas(prev => {
      const existe = prev.some(c => c.id_cita === citaEditada.id_cita);
      if (existe) return prev.map(c => (c.id_cita === citaEditada.id_cita ? citaEditada : c));
      return [...prev, citaEditada];
    });
    setCitaSeleccionada(null);
  };

  return (
    <main className="daily-agenda-main">
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
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div
        className="agenda-grid"
        style={{ gridTemplateColumns: `80px repeat(${empleadosAMostrar.length * diasSemana.length}, 1fr)` }}
      >
        {/* Cabecera reloj */}
        <div className="weekly-clock-header">
          <button className="weekly-clock-btn">
            <FaClock /><FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {/* Cabecera empleados y días */}
        {diasSemana.map(day =>
          empleadosAMostrar.map(emp => (
            <div className="employee-header" key={`${emp.id}-${day.id}`}>
              <img src={avatar} alt={emp.nombre} />
              <span>{emp.nombre}</span>
              <div className="day-agenda">{day.label}</div>
            </div>
          ))
        )}

        {/* Filas de horas */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {diasSemana.map(day =>
              empleadosAMostrar.map(emp => {
                const empCitas = citas.filter(c => c.id_persona === emp.id && c.fecha.slice(0,10) === day.dateStr);
                return (
                  <div className="time-cell" key={`${emp.id}-${day.id}-${hour}`} style={{ position: 'relative' }}>
                    {empCitas.map(cita => {
                      const startMin = horaAMinutos(cita.hora_inicio);
                      const endMin = horaAMinutos(cita.hora_final);
                      const hourStart = horaAMinutos(hour);
                      const top = Math.max(startMin - hourStart, 0);
                      const height = Math.min(endMin, hourStart + 60) - Math.max(startMin, hourStart);

                      return (
                        <div
                          className="appointment"
                          key={cita.id_cita}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            width: '90%',
                            left: '5%',
                            position: 'absolute',
                            backgroundColor: cita.color || '#4CAF50'
                          }}
                          onClick={() => setCitaSeleccionada(cita)}
                        >
                          <strong>{cita.nombre_cliente}</strong>
                          <div className="titulo-cita">{cita.titulo}</div>
                          <small>{cita.hora_inicio.slice(0,5)} - {cita.hora_final.slice(0,5)}</small>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </React.Fragment>
        ))}
      </div>

      {citaSeleccionada && (
        <ModalCita modo="editar" cita={citaSeleccionada} onClose={() => setCitaSeleccionada(null)} onSave={actualizarCita} />
      )}
    </main>
  );
};

export default AgendaSemanal;
