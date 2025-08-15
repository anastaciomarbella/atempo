import React, { useState, useEffect, useMemo } from 'react';
import '../styles/agendaDiaria.css';
import avatar from '../assets/avatar.png';
import { FaClock, FaChevronDown } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModalCita from '../components/modalCita/modalCita';

const AgendaDiaria = () => {
  const [personas, setPersonas] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState('todos');
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch('https://mi-api-atempo.onrender.com/api/personas');
        const data = await res.json();
        setPersonas(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las personas.');
      }
    };
    fetchPersonas();
  }, []);

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'https://mi-api-atempo.onrender.com/api/citas';
        if (personaSeleccionada !== 'todos') url += `?id_persona=${personaSeleccionada}`;
        const res = await fetch(url);
        let data = await res.json();
        const fechaStr = fechaSeleccionada.toISOString().slice(0, 10);
        data = data.filter(cita => cita.fecha.slice(0, 10) === fechaStr);
        setCitas(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las citas.');
      }
      setLoading(false);
    };
    fetchCitas();
  }, [personaSeleccionada, fechaSeleccionada]);

  const cambiarFecha = (delta) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const empleadosAMostrar = useMemo(() => {
    return personaSeleccionada === 'todos'
      ? personas
      : [personas.find(p => p.id === Number(personaSeleccionada))].filter(Boolean);
  }, [personaSeleccionada, personas]);

  // Función para convertir hora a minutos
  const horaAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  return (
    <main className="daily-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button aria-label="Anterior" className="date-nav-btn" onClick={() => cambiarFecha(-1)}><FiChevronLeft /></button>
          <button aria-label="Siguiente" className="date-nav-btn" onClick={() => cambiarFecha(1)}><FiChevronRight /></button>
          <span className="fecha-display">
            {fechaSeleccionada.toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
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

      {loading && <div className="loading">Cargando citas...</div>}
      {error && <div className="error">{error}</div>}

      <div
        className="agenda-grid"
        style={{ gridTemplateColumns: `80px repeat(${empleadosAMostrar.length}, 1fr)` }}
      >
        <div className="employee-header clock-header">
          <button className="clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {empleadosAMostrar.map(emp => (
          <div className="employee-header" key={emp.id}>
            <img src={avatar} alt={`Avatar de ${emp.nombre}`} />
            <span>{emp.nombre}</span>
          </div>
        ))}

        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {empleadosAMostrar.map(emp => {
              const empCitas = citas.filter(c => c.id_persona === emp.id);
              return (
                <div className="time-cell" key={`${emp.id}-${hour}`}>
                  {empCitas.map((cita, index, array) => {
                    const startMin = horaAMinutos(cita.hora_inicio);
                    const endMin = horaAMinutos(cita.hora_final);
                    const hourStart = horaAMinutos(hour);
                    const hourEnd = hourStart + 60;

                    if (endMin <= hourStart || startMin >= hourEnd) return null;

                    const top = Math.max(startMin - hourStart, 0);
                    const height = Math.min(endMin, hourEnd) - Math.max(startMin, hourStart);

                    // Calcular solapamientos
                    const overlapping = array.filter(c =>
                      horaAMinutos(c.hora_inicio) < endMin &&
                      horaAMinutos(c.hora_final) > startMin
                    );
                    const idx = overlapping.findIndex(c => c.id_cita === cita.id_cita);
                    const width = 100 / overlapping.length;
                    const left = idx * width;

                    return (
                      <div
                        className="appointment"
                        key={cita.id_cita}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: cita.color || '#4CAF50' // Color de la BD o verde por defecto
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

export default AgendaDiaria;
