import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTrash } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0', '#def31f',
  '#00fca8', '#47f183', '#58b4f1', '#3dc2ff',
  '#5e3aff', '#e42591', '#f3343e'
];

function convertirA24h(hora) {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

const ModalCita = ({ modo = 'crear', cita = {}, onClose, onSave }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [formulario, setFormulario] = useState({
    id_cliente: null,      // ✅ CORRECTO
    encargado: '',
    titulo: '',
    fecha: '',
    start: '',
    end: '',
    client: '',
    clientPhone: '',
    comentario: '',
    color: coloresDisponibles[0]
  });

  const token = localStorage.getItem('token');

  // =============================
  // CARGAR EMPLEADOS
  // =============================
  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPersonas(Array.isArray(data) ? data : []))
      .catch(() => setPersonas([]));
  }, [token]);

  // =============================
  // CARGAR DATOS AL EDITAR
  // =============================
  useEffect(() => {
    if (modo === 'editar' && cita) {
      const encargadoEncontrado = personas.find(p => p.id === cita.id_cliente);

      setFormulario({
        id_cliente: cita.id_cliente || null,
        encargado: encargadoEncontrado?.nombre || '',
        titulo: cita.titulo || '',
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleEncargadoSelect = persona => {
    setFormulario(prev => ({
      ...prev,
      id_cliente: persona.id,
      encargado: persona.nombre
    }));
    setMostrarListaEncargados(false);
  };

  const handleGuardar = async () => {
    if (
      !formulario.titulo ||
      !formulario.fecha ||
      !formulario.start ||
      !formulario.end ||
      !formulario.id_cliente
    ) {
      setMensaje('Todos los campos obligatorios deben completarse.');
      return;
    }

    setGuardando(true);

    const dataParaEnviar = {
      id_cliente: formulario.id_cliente,   // ✅ CLAVE
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
      const url =
        modo === 'editar'
          ? `https://mi-api-atempo.onrender.com/api/citas/${cita.id}`
          : 'https://mi-api-atempo.onrender.com/api/citas';

      const res = await fetch(url, {
        method: modo === 'editar' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataParaEnviar)
      });

      if (!res.ok) throw new Error(await res.text());

      if (onSave) onSave();
      setMensaje('Cita guardada correctamente');
      setTimeout(onClose, 1200);
    } catch (error) {
      setMensaje('Error al guardar la cita');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm('¿Eliminar esta cita?')) return;

    try {
      await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onSave) onSave();
      onClose();
    } catch {
      setMensaje('Error al eliminar');
    }
  };

  return (
    <>
      <div className="agendar-overlay visible" />
      <div className="agendar-modal">
        <button onClick={onClose} className="agendar-cerrar-modal">
          <FaTimes />
        </button>

        <h2>{modo === 'editar' ? 'Editar cita' : 'Agendar cita'}</h2>

        <input name="titulo" placeholder="Título *" value={formulario.titulo} onChange={handleChange} />

        <div className="dropdown-encargado">
          <button onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)}>
            {formulario.encargado || 'Seleccionar encargado *'}
          </button>
          {mostrarListaEncargados && (
            <ul>
              {personas.map(p => (
                <li key={p.id} onClick={() => handleEncargadoSelect(p)}>
                  {p.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} />
        <input type="time" name="start" value={formulario.start} onChange={handleChange} />
        <input type="time" name="end" value={formulario.end} onChange={handleChange} />

        <input name="client" placeholder="Cliente" value={formulario.client} onChange={handleChange} />
        <input name="clientPhone" placeholder="Teléfono" value={formulario.clientPhone} onChange={handleChange} />
        <input name="comentario" placeholder="Comentario" value={formulario.comentario} onChange={handleChange} />

        <div className="agendar-colores">
          {coloresDisponibles.map(c => (
            <span
              key={c}
              style={{ background: c }}
              className={formulario.color === c ? 'seleccionado' : ''}
              onClick={() => setFormulario(prev => ({ ...prev, color: c }))}
            />
          ))}
        </div>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <button onClick={handleGuardar} disabled={guardando}>
          <FaSave /> Guardar
        </button>

        {modo === 'editar' && (
          <button onClick={handleEliminar}>
            <FaTrash /> Eliminar
          </button>
        )}
      </div>
    </>
  );
};

export default ModalCita;