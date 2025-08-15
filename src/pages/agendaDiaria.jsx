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
  const alturaHora = 62; // altura de cada hora en px
  const primerHoraMin = 8 * 60; // 08:00 en minutos
  const pxPorMinuto = alturaHora / 60;

  // Cargar personas
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

  // Cargar citas según persona y fecha
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

  const horaAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };

  const actualizarCita = (citaEditada) => {
    setCitas(prev => {
      const existe = prev.some(c => c.id_cita === citaEditada.id_cita);
      if (existe) {
        return prev.map(c => c.id_cita === citaEditada.id_cita ? citaEditada : c);
      } else {
        return [...prev, citaEditada];
      }
    });
    setCitaSeleccionada(null);
  };

  return (
    <main className="daily-agenda-main">
      <div className="agenda-header">
        <div className="nav-date">
          <button aria-label="Anterior" className="date-nav-btn" onClick={() => cambiarFecha(-1)}>
            <FiChevronLeft />
          </button>
          <button aria-label="Siguiente" className="date-nav-btn" onClick={() => cambiarFecha(1)}>
            <FiChevronRight />
          </button>
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
        style={{
          gridTemplateColumns: `80px repeat(${empleadosAMostrar.length}, 1fr)`,
          position: 'relative'
        }}
      >
        {/* Columna de horas */}
        <div className="employee-header clock-header">
          <button className="clock-btn">
            <FaClock />
            <FaChevronDown className="dropdown-arrow" />
          </button>
        </div>

        {/* Encabezado empleados */}
        {empleadosAMostrar.map(emp => (
          <div className="employee-header" key={emp.id}>
            <img src={avatar} alt={`Avatar de ${emp.nombre}`} />
            <span>{emp.nombre}</span>
          </div>
        ))}

        {/* Celdas de horas (fondo) */}
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="hour-cell">{hour}</div>
            {empleadosAMostrar.map(emp => (
              <div
                key={`${emp.id}-${hour}`}
                className="time-cell"
                style={{ height: `${alturaHora}px` }}
              ></div>
            ))}
          </React.Fragment>
        ))}

        {/* Citas completas */}
        {empleadosAMostrar.map((emp, empIndex) => {
          const empCitas = citas.filter(c => c.id_persona === emp.id);
          return empCitas.map(cita => {
            const startMin = horaAMinutos(cita.hora_inicio);
            const endMin = horaAMinutos(cita.hora_final);
            const top = (startMin - primerHoraMin) * pxPorMinuto;
            const height = (endMin - startMin) * pxPorMinuto;

            return (
              <div
                key={cita.id_cita}
                className="appointment"
                style={{
                  position: 'absolute',
                  top: `${top + alturaHora}px`, // +alturaHora para saltar el header
                  left: `${80 + empIndex * (100 / empleadosAMostrar.length)}%`, // ajusta posición
                  transform: `translateX(-${(100 / empleadosAMostrar.length) * (empleadosAMostrar.length - 1)}%)`,
                  height: `${height}px`,
                  width: `calc(${100 / empleadosAMostrar.length}% - 10px)`,
                  backgroundColor: cita.color || '#4CAF50',
                  borderRadius: '6px',
                  padding: '4px',
                  fontSize: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <strong>{cita.nombre_cliente}</strong>
                <div className="titulo-cita">{cita.titulo}</div>
                <small>{cita.hora_inicio.slice(0, 5)} - {cita.hora_final.slice(0, 5)}</small>
              </div>
            );
          });
        })}
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

export default AgendaDiaria;
