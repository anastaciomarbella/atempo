import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef9c3', '#bbf7d0',
  '#dcfce7', '#e0f2fe', '#b3e5fc', '#c7d2fe',
  '#e9d5ff', '#fbcfe8', '#fecaca', '#fed7aa',
  '#eeb2c6ff','#d188f3ff','#7eda7bff','#79c9e9ff'
];

const ModalCita = ({ onClose, modo, cita, fechaSeleccionada }) => {
  const [empleados, setEmpleados] = useState([]);
  const [formulario, setFormulario] = useState({
    id_persona: '',
    titulo: '',
    fecha: '',
    start: '',
    end: '',
    client: '',
    clientPhone: '',
    comentario: '',
    color: coloresDisponibles[0]
  });
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const res = await fetch('https://mi-api-atempo.onrender.com/api/personas');
        const data = await res.json();
        setEmpleados(data);
      } catch (error) {
        console.error('Error cargando empleados:', error);
      }
    };
    fetchEmpleados();
  }, []);

  useEffect(() => {
    if (modo === 'editar' && cita) {
      setFormulario({
        id_persona: cita.id_persona,
        titulo: cita.titulo,
        fecha: cita.fecha,
        start: convertirAmPmA24h(cita.hora_inicio),
        end: convertirAmPmA24h(cita.hora_final),
        client: cita.nombre_cliente,
        clientPhone: cita.numero_cliente,
        comentario: cita.motivo,
        color: cita.color || coloresDisponibles[0]
      });
    } else if (modo === 'crear' && fechaSeleccionada) {
      setFormulario(prev => ({ ...prev, fecha: fechaSeleccionada }));
    }
  }, [modo, cita, fechaSeleccionada]);

  const convertirAmPmA24h = (horaAmPm) => {
    if (!horaAmPm) return '';
    const [hora, minutosAmPm] = horaAmPm.split(':');
    const [minutos, ampm] = minutosAmPm.split(' ');
    let h = parseInt(hora, 10);
    if (ampm.toLowerCase() === 'pm' && h !== 12) h += 12;
    if (ampm.toLowerCase() === 'am' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutos}`;
  };

  const convertir24hAAmPm = (hora24) => {
    if (!hora24) return '';
    let [h, m] = hora24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    if (!formulario.id_persona) {
      setMensaje('Por favor selecciona un encargado válido.');
      return;
    }
    if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const hora_inicio = convertir24hAAmPm(formulario.start);
    const hora_final = convertir24hAAmPm(formulario.end);

    // Detectar si id_persona es numérico o UUID
    let idPersonaParaEnviar = formulario.id_persona;
    if (typeof idPersonaParaEnviar === 'string') {
      if (/^\d+$/.test(idPersonaParaEnviar)) {
        idPersonaParaEnviar = parseInt(idPersonaParaEnviar, 10);
      }
    }

    const dataParaEnviar = {
      id_persona: idPersonaParaEnviar,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio,
      hora_final,
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      const url = modo === 'editar'
        ? `https://mi-api-atempo.onrender.com/api/citas/${cita.id_cita}`
        : 'https://mi-api-atempo.onrender.com/api/citas';

      const metodo = modo === 'editar' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataParaEnviar)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar la cita');
      }

      setMensaje(modo === 'editar'
        ? 'La cita ha sido actualizada exitosamente.'
        : 'Tu cita ha sido agendada exitosamente.'
      );

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      setMensaje('Error al guardar la cita: ' + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-cita-overlay">
      <div className="modal-cita">
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
        <h2>{modo === 'editar' ? 'Editar Cita' : 'Nueva Cita'}</h2>

        {mensaje && <div className="mensaje">{mensaje}</div>}

        <label>Encargado:</label>
        <select name="id_persona" value={formulario.id_persona} onChange={handleChange}>
          <option value="">Selecciona encargado</option>
          {empleados.map(emp => (
            <option key={emp.id_persona} value={emp.id_persona}>
              {emp.nombre}
            </option>
          ))}
        </select>

        <label>Título:</label>
        <input type="text" name="titulo" value={formulario.titulo} onChange={handleChange} />

        <label>Fecha:</label>
        <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} />

        <label>Hora inicio:</label>
        <input type="time" name="start" value={formulario.start} onChange={handleChange} />

        <label>Hora final:</label>
        <input type="time" name="end" value={formulario.end} onChange={handleChange} />

        <label>Nombre cliente:</label>
        <input type="text" name="client" value={formulario.client} onChange={handleChange} />

        <label>Teléfono cliente:</label>
        <input type="text" name="clientPhone" value={formulario.clientPhone} onChange={handleChange} />

        <label>Motivo:</label>
        <textarea name="comentario" value={formulario.comentario} onChange={handleChange}></textarea>

        <label>Color:</label>
        <div className="color-picker">
          {coloresDisponibles.map(color => (
            <div
              key={color}
              className={`color-box ${formulario.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormulario(prev => ({ ...prev, color }))}
            />
          ))}
        </div>

        <button
          className="save-btn"
          onClick={handleGuardar}
          disabled={guardando}
        >
          <FaSave /> {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default ModalCita;
