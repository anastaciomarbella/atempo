import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import './modalCita.css';

const API_URL = 'https://mi-api-atempo.onrender.com/api';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0','#def31f','#00fca8',
  '#47f183', '#58b4f1', '#3dc2ff', '#5e3aff', '#e42591','#f3343e',
  '#14f5bd', '#f9a825', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4'
];

function convertirA24h(hora) {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

/* ===========================
   🔐 FETCH CON AUTENTICACIÓN
=========================== */
const fetchConAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Error en la petición');
  }

  return res;
};

const ModalCita = ({ modo = 'crear', cita = {}, onClose, onSave }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    id_persona: null,
    titulo: '',
    encargado: '',
    fecha: '',
    start: '',
    end: '',
    client: '',
    clientPhone: '',
    comentario: '',
    color: coloresDisponibles[0]
  });

  /* ===========================
     📥 CARGAR PERSONAS
  =========================== */
  useEffect(() => {
    const cargarPersonas = async () => {
      try {
        const res = await fetchConAuth(`${API_URL}/personas`, {
          method: 'GET'
        });
        const data = await res.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando personas:', error);
      }
    };

    cargarPersonas();
  }, []);

  /* ===========================
     ✏️ CARGAR DATOS AL EDITAR
  =========================== */
  useEffect(() => {
    if (modo === 'editar' && cita && personas.length > 0) {
      const encargadoEncontrado = personas.find(
        p => p.id === cita.id_persona
      );

      setFormulario({
        id_persona: cita.id_persona || null,
        titulo: cita.titulo || '',
        encargado: encargadoEncontrado ? encargadoEncontrado.nombre : '',
        fecha: cita.fecha || '',
        start: cita.hora_inicio || '',
        end: cita.hora_final || '',
        client: cita.nombre_cliente || '',
        clientPhone: cita.numero_cliente || '',
        comentario: cita.motivo || '',
        color: cita.color || coloresDisponibles[0]
      });
    }
  }, [modo, cita, personas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleColorSelect = (color) => {
    setFormulario(prev => ({ ...prev, color }));
  };

  const handleEncargadoSelect = (persona) => {
    setFormulario(prev => ({
      ...prev,
      id_persona: persona.id,
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
  };

  const quitarEncargado = () => {
    setFormulario(prev => ({
      ...prev,
      id_persona: null,
      encargado: ''
    }));
    setMostrarListaEncargados(false);
  };

  /* ===========================
     💾 GUARDAR
  =========================== */
  const handleGuardar = async () => {
    if (!formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Por favor completa los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    const dataParaEnviar = {
      id_persona: formulario.id_persona || null,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: convertirA24h(formulario.start),
      hora_final: convertirA24h(formulario.end),
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      const url = modo === 'editar'
        ? `${API_URL}/citas/${cita.id}`
        : `${API_URL}/citas`;

      await fetchConAuth(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        body: JSON.stringify(dataParaEnviar)
      });

      if (onSave) {
        onSave({
          id_cita: cita?.id || Date.now(),
          ...dataParaEnviar
        });
      }

      setMensaje('Tu cita ha sido guardada exitosamente.');
      setTimeout(() => onClose(), 1200);

    } catch (error) {
      setMensaje('Error al guardar la cita: ' + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  /* ===========================
     🗑 ELIMINAR
  =========================== */
  const handleEliminar = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta cita?')) return;

    try {
      await fetchConAuth(`${API_URL}/citas/${cita.id}`, {
        method: 'DELETE'
      });

      if (onSave) onSave({ id_cita: cita.id, eliminar: true });

      setMensaje('Cita eliminada correctamente.');
      setTimeout(() => onClose(), 1000);

    } catch (error) {
      setMensaje('Error al eliminar la cita: ' + error.message);
    }
  };

  /* ===========================
     🎨 UI
  =========================== */
  return (
    <>
      <div className="agendar-overlay visible"></div>
      <div className="agendar-modal">

        <button className="agendar-cerrar-modal" onClick={onClose} disabled={guardando}>
          <FaTimes />
        </button>

        <h2 className="agendar-titulo-modal">
          {modo === 'editar' ? 'Detalles de la cita' : 'Agendar cita'}
        </h2>

        <div className="agendar-formulario">

          <label>Título *</label>
          <input
            name="titulo"
            value={formulario.titulo}
            onChange={handleChange}
            disabled={guardando}
          />

          <label>Encargado (opcional)</label>
          <div className="dropdown-encargado">
            <button
              type="button"
              onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)}
            >
              {formulario.encargado || 'Sin encargado'}
            </button>

            {mostrarListaEncargados && (
              <ul className="dropdown-lista">
                <li onClick={quitarEncargado}>➖ Sin encargado</li>
                {personas.map(p => (
                  <li key={p.id} onClick={() => handleEncargadoSelect(p)}>
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label>Fecha *</label>
          <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} />

          <label>Hora *</label>
          <div>
            <input type="time" name="start" value={formulario.start} onChange={handleChange} />
            <span> a </span>
            <input type="time" name="end" value={formulario.end} onChange={handleChange} />
          </div>

          <label>Cliente</label>
          <input name="client" value={formulario.client} onChange={handleChange} />

          <label>Número celular</label>
          <input name="clientPhone" value={formulario.clientPhone} onChange={handleChange} />

          <label>Comentario</label>
          <input name="comentario" value={formulario.comentario} onChange={handleChange} />

          <label>Color *</label>
          <div className="agendar-colores">
            {coloresDisponibles.map((color, i) => (
              <span
                key={i}
                className={`agendar-color ${formulario.color === color ? 'seleccionado' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>

          {mensaje && (
            <div style={{
              marginTop: 10,
              color: mensaje.startsWith('Error') ? 'red' : 'green',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {mensaje}
            </div>
          )}

          <div className="agendar-botones">
            <button onClick={handleGuardar} disabled={guardando}>
              <FaSave /> {guardando ? 'Guardando...' : 'Guardar'}
            </button>

            {modo === 'editar' && (
              <button onClick={handleEliminar} disabled={guardando}>
                <FaTrash /> Eliminar
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ModalCita;