import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import '../styles/modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef3c7', '#dcfce7',
  '#dbeafe', '#ede9fe', '#fee2e2', '#d1fae5',
  '#bfdbfe', '#ddd6fe'
];

const ModalCita = ({ modo = 'crear', cita = {}, onClose }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [formulario, setFormulario] = useState({
    id_persona: cita.id_persona || null,
    titulo: cita.titulo || '',
    encargado: cita.encargado || '',
    fecha: cita.fecha ? cita.fecha.slice(0, 10) : '',
    start: cita.hora_inicio || '',
    end: cita.hora_final || '',
    client: cita.nombre_cliente || '',
    clientPhone: cita.telefono_cliente || '',
    comentario: cita.comentario || '',
    color: cita.color || coloresDisponibles[0]
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch('https://mi-api-atempo.onrender.com/api/personas');
        const data = await res.json();
        setPersonas(data);
      } catch (error) {
        console.error('Error al cargar personas:', error);
      }
    };
    fetchPersonas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color) => {
    setFormulario(prev => ({ ...prev, color }));
  };

  const handleEncargadoSelect = (encargado) => {
    setFormulario(prev => ({ ...prev, encargado }));
    setMostrarListaEncargados(false);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');
    try {
      // Validaciones simples (puedes agregar más)
      if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
        setMensaje('Por favor completa los campos obligatorios.');
        setGuardando(false);
        return;
      }

      const method = modo === 'editar' ? 'PUT' : 'POST';
      const url = modo === 'editar'
        ? `https://mi-api-atempo.onrender.com/api/citas/${cita.id}`
        : 'https://mi-api-atempo.onrender.com/api/citas';

      const payload = {
        id_persona: formulario.id_persona,
        titulo: formulario.titulo,
        encargado: formulario.encargado,
        fecha: formulario.fecha,
        hora_inicio: formulario.start,
        hora_final: formulario.end,
        nombre_cliente: formulario.client,
        telefono_cliente: formulario.clientPhone,
        comentario: formulario.comentario,
        color: formulario.color,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar la cita');

      const data = await res.json();
      setMensaje('Cita guardada correctamente.');
      setTimeout(() => onClose(data), 1000);

    } catch (error) {
      setMensaje('Error al guardar: ' + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!cita?.id) return;
    if (!window.confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      const res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar la cita');

      setMensaje('La cita fue eliminada correctamente.');
      setTimeout(() => {
        onClose({ eliminada: true, id: cita.id });
      }, 1500);

    } catch (error) {
      setMensaje('Error al eliminar la cita: ' + error.message);
      console.error(error);
    }
  };

  return (
    <>
      <div className="agendar-overlay visible"></div>
      <div className="agendar-modal">
        <button className="agendar-cerrar-modal" onClick={() => onClose()} disabled={guardando}>
          <FaTimes />
        </button>
        <h2 className="agendar-titulo-modal">
          {modo === 'editar' ? 'Detalles de la cita' : 'Agendar cita'}
        </h2>

        <div className="agendar-formulario">
          {/* Aquí debes agregar los inputs del formulario, por ejemplo: */}
          <label>
            Título*:
            <input
              type="text"
              name="titulo"
              value={formulario.titulo}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Fecha*:
            <input
              type="date"
              name="fecha"
              value={formulario.fecha}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Hora inicio*:
            <input
              type="time"
              name="start"
              value={formulario.start}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Hora fin*:
            <input
              type="time"
              name="end"
              value={formulario.end}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Cliente:
            <input
              type="text"
              name="client"
              value={formulario.client}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Teléfono cliente:
            <input
              type="tel"
              name="clientPhone"
              value={formulario.clientPhone}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <label>
            Comentario:
            <textarea
              name="comentario"
              value={formulario.comentario}
              onChange={handleChange}
              disabled={guardando}
            />
          </label>

          <div>
            <span>Color:</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {coloresDisponibles.map(color => (
                <div
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: formulario.color === color ? '3px solid black' : '1px solid gray',
                  }}
                />
              ))}
            </div>
          </div>

          {mensaje && (
            <div
              style={{
                marginTop: '10px',
                color: mensaje.startsWith('Error') ? 'red' : 'green',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              {mensaje}
            </div>
          )}

          <p className="agendar-obligatorio">* Campos obligatorios</p>

          <button
            className="agendar-btn-guardar"
            onClick={handleGuardar}
            disabled={guardando}
          >
            <FaSave className="icono-guardar" />
            {guardando ? 'Guardando...' : modo === 'editar' ? 'Guardar cambios' : 'Guardar cita'}
          </button>

          {modo === 'editar' && (
            <button
              className="agendar-btn-eliminar"
              onClick={handleEliminar}
              disabled={guardando}
              style={{ backgroundColor: 'red', color: 'white', marginTop: '10px' }}
            >
              Eliminar cita
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalCita;
