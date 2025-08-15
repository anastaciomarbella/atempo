import React, { useState, useEffect, useMemo } from 'react';
import '../styles/agendaSemanal.css';
import avatar from '../assets/avatar.png';
import { FaClock } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaSemanal = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('todos');
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  const fechaInicioSemana = useMemo(() => {
    const d = new Date(fechaSeleccionada);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [fechaSeleccionada]);

  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(fechaInicioSemana);
      date.setDate(fechaInicioSemana.getDate() + i);
      return {
        id: i,
        label: date.toLocaleDateString('es-MX', { weekday: 'short' }),
        date,
        dateStr: date.toISOString().slice(0, 10)
      };
    });
  }, [fechaInicioSemana]);

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

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        let url = `${API_URL}/api/citas`;
        if (personaSeleccionada !== 'todos') {
          url = `${API_URL}/api/citas/persona/${personaSeleccionada}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const inicio = diasSemana[0].date;
        const fin = diasSemana[6].date;
        const citasFiltradas = data.filter(cita => {
          const citaFecha = new Date(cita.fecha);
          return citaFecha >= inicio && citaFecha <= fin;
        });
        setCitas(citasFiltradas);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, diasSemana, API_URL]);

  const cambiarSemana = dias => {
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

  return (
    <main className="weekly-agenda-main">
      {/* Header de semana */}
      <div className="agenda-header" style={{ justifyContent: 'space-between' }}>
        <button className="date-nav-btn" onClick={() => cambiarSemana(-7)}>
          <FiChevronLeft />
        </button>
        <span>
          {diasSemana[0].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} -{' '}
          {diasSemana[6].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button className="date-nav-btn" onClick={() => cambiarSemana(7)}>
          <FiChevronRight />
        </button>
      </div>

      {/* Filtro de empleado */}
      <div style={{ margin: '8px 0' }}>
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

      {/* Grid de agenda */}
      <div
        className="agenda-grid"
        style={{
          gridTemplateColumns: `80px repeat(${diasSemana.length * personas.length}, 1fr)`,
        }}
      >
        {/* Columna de reloj */}
        <div className="weekly-clock-header">
          <FaClock />
        </div>

        {/* Header: días × empleados */}
        {diasSemana.map(day =>
          personas.map(p => (
            <div className="employee-header" key={`${day.dateStr}-${p.id}`} style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                {day.label} {day.date.getDate()}/{day.date.getMonth() + 1}
              </div>
              <img src={avatar} alt={p.nombre} className="person-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '4px 0' }} />
              <span className="person-name">{p.nombre}</span>
            </div>
          ))
        )}

        {/* Filas por hora */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell" style={{ height: '62px', lineHeight: '62px' }}>{hour}</div>
            {diasSemana.map(day =>
              personas.map(persona => {
                const citasPersona = citas.filter(
                  cita => cita.id_persona === persona.id && cita.fecha.slice(0, 10) === day.dateStr
                );

                return (
                  <div
                    className="time-cell"
                    key={`${day.dateStr}-${persona.id}-${hour}`}
                    style={{ position: 'relative', height: '62px' }}
                  >
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
                            cursor: 'pointer',
                            color: '#000',
                            fontSize: '12px',
                            overflow: 'hidden',
                            width: '90%',
                            left: '5%',
                            boxSizing: 'border-box'
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
              })
            )}
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
