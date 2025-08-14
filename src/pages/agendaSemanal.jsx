import React, { useState, useEffect, useMemo } from 'react';
import '../styles/agendaSemanal.css';
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

  // Base URL desde variable de entorno
  const API_URL = process.env.REACT_APP_API_URL || 'https://mi-api-atempo.onrender.com';

  const fechaInicioSemana = useMemo(() => {
    const d = new Date(fechaSeleccionada);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
    return new Date(d.setDate(diff));
  }, [fechaSeleccionada]);

  const diasSemana = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(fechaInicioSemana);
      date.setDate(fechaInicioSemana.getDate() + i);
      return {
        id: i + 1,
        label: date.toLocaleDateString('es-MX', { weekday: 'long' }),
        date: date,
        dateStr: date.toISOString().slice(0, 10),
      };
    });
  }, [fechaInicioSemana]);

  const hours = Array.from({ length: 8 }, (_, i) => `${String(9 + i).padStart(2, '0')}:00`);

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

        const citasFiltradas = data.filter(cita => {
          const citaFecha = new Date(cita.fecha);
          return citaFecha >= diasSemana[0].date && citaFecha <= diasSemana[6].date;
        });

        setCitas(citasFiltradas);
      } catch (error) {
        console.error('Error cargando citas:', error);
      }
    };
    fetchCitas();
  }, [personaSeleccionada, diasSemana, API_URL]);

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <main className="weekly-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button className="date-nav-btn" onClick={() => cambiarFecha(-7)}><FiChevronLeft /></button>
          <button className="date-nav-btn" onClick={() => cambiarFecha(7)}><FiChevronRight /></button>
          <span>
            Del {diasSemana[0].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} al {diasSemana[6].date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
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

      <div className="agenda-grid" style={{ gridTemplateColumns: `80px repeat(${diasSemana.length}, 1fr)` }}>
        <div className="employee-header weekly-clock-header">
          <button className="weekly-clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {diasSemana.map((day, index) => (
          <div className={`employee-header ${index === diasSemana.length - 1 ? 'last' : ''}`} key={day.id}>
            <span className='day-agenda'>{day.label}<br />{day.date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}</span>
          </div>
        ))}

        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {diasSemana.map((day, index) => {
              const citasDiaHora = citas.filter(cita => {
                const citaDateStr = new Date(cita.fecha).toISOString().slice(0, 10);
                if (citaDateStr !== day.dateStr) return false;

                const [startHour] = cita.hora_inicio.split(':');
                return parseInt(startHour, 10) === parseInt(hour.split(':')[0], 10);
              });

              return (
                <div className={`time-cell ${index === diasSemana.length - 1 ? 'last' : ''}`} key={`${day.id}-${hour}`}>
                  {citasDiaHora.map((cita, i) => {
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
                        key={index}
                        style={{
                          height: '60px',
                          backgroundColor: cita.color || '#e0e0e0',
                          borderRadius: '6px',
                          padding: '4px',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          color: '#000',
                          fontSize: '12px',
                          overflow: 'hidden'
                        }}
                        onClick={() => setCitaSeleccionada(cita)}
                      >
                        <strong>{cita.nombre_cliente || cita.client}</strong>
                        <div>{cita.titulo || cita.service}</div>
                        <small>{cita.hora_inicio} - {cita.hora_final}</small>
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
        />
      )}
    </main>
  );
};

export default AgendaSemanal;
