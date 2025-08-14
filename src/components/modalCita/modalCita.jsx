import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import './modalCita.css';

const coloresDisponibles = [
  '#ffe4e6', '#ffedd5', '#fef9c3', '#bbf7d0',
  '#dcfce7', '#e0f2fe', '#b3e5fc', '#ede9fe', '#fce7f3'
];

function convertir24hAAmPm(hora24) {
  if (!hora24) return '';
  const [horaStr, minStr] = hora24.split(':');
  let hora = parseInt(horaStr, 10);
  const minutos = minStr;
  const ampm = hora >= 12 ? 'PM' : 'AM';
  hora = hora % 12;
  if (hora === 0) hora = 12;
  return `${hora}:${minutos} ${ampm}`;
}

const ModalCita = ({ modo = 'crear', cita = {}, onClose }) => {
  const [personas, setPersonas] = useState([]);
  const [mostrarListaEncargados, setMostrarListaEncargados] = useState(false);
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
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch('https://mi-api-atempo.onrender.com/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (modo === 'editar' && cita && personas.length > 0) {
      const encargado = personas.find(p => p.id === cita.id_persona);
      setFormulario({
        id_persona: cita.id_persona || null,
        titulo: cita.titulo || '',
        encargado: encargado ? encargado.nombre : '',
        fecha: cita.fecha || '',
        start: cita.hora_inicio ? cita.hora_inicio.slice(0,5) : '',
        end: cita.hora_final ? cita.hora_final.slice(0,5) : '',
        client: cita.nombre_cliente || '',
        clientPhone: cita.numero_cliente || '',
        comentario: cita.motivo || '',
        color: cita.color || coloresDisponibles[0]
      });
    }
  }, [modo, cita, personas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'start' || name === 'end') && mostrarListaEncargados) setMostrarListaEncargados(false);
    setFormulario(prev => ({ ...prev, [name]: value }));
    setMensaje('');
  };

  const handleColorSelect = (color) => setFormulario(prev => ({ ...prev, color }));
  const handleEncargadoSelect = (persona) => {
    setFormulario(prev => ({ ...prev, id_persona: persona.id, encargado: persona.nombre }));
    setMostrarListaEncargados(false);
  };

  const handleGuardar = async () => {
    if (!formulario.id_persona || !formulario.titulo || !formulario.fecha || !formulario.start || !formulario.end) {
      setMensaje('Completa todos los campos obligatorios.');
      return;
    }
    setGuardando(true);

    const dataParaEnviar = {
      id_persona: formulario.id_persona,
      titulo: formulario.titulo,
      fecha: formulario.fecha,
      hora_inicio: formulario.start + ':00',
      hora_final: formulario.end + ':00',
      nombre_cliente: formulario.client,
      numero_cliente: formulario.clientPhone,
      motivo: formulario.comentario,
      color: formulario.color
    };

    try {
      let res;
      if (modo === 'crear') {
        res = await fetch('https://mi-api-atempo.onrender.com/api/citas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar)
        });
      } else {
        res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id_cita}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataParaEnviar)
        });
      }
      if (!res.ok) throw new Error('Error al guardar la cita');

      setMensaje('Cita guardada exitosamente.');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMensaje('Error al guardar la cita: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!cita.id_cita) return;
    if (!window.confirm('¿Deseas eliminar esta cita?')) return;

    setGuardando(true);
    try {
      const res = await fetch(`https://mi-api-atempo.onrender.com/api/citas/${cita.id_cita}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la cita');
      setMensaje('Cita eliminada correctamente.');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMensaje('Error al eliminar la cita: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="agendar-overlay visible"></div>
      <div className="agendar-modal">
        <button className="agendar-cerrar-modal" onClick={onClose} disabled={guardando}><FaTimes /></button>
        <h2>{modo === 'editar' ? 'Detalles de la cita' : 'Agendar citas'}</h2>

        <div className="agendar-formulario">
          <div className="agendar-fila">
            <div>
              <label>Título *</label>
              <input name="titulo" value={formulario.titulo} onChange={handleChange} disabled={guardando}/>
            </div>
            <div>
              <label>Encargado *</label>
              <div className="dropdown-encargado">
                <button onClick={() => setMostrarListaEncargados(!mostrarListaEncargados)} disabled={guardando}>
                  {formulario.encargado || 'Selecciona un encargado'}
                </button>
                {mostrarListaEncargados && (
                  <ul>
                    {personas.map(p => <li key={p.id} onClick={() => handleEncargadoSelect(p)}>{p.nombre}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Fecha *</label>
              <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} disabled={guardando}/>
            </div>
            <div>
              <label>Hora *</label>
              <div className="agendar-horario">
                <input type="time" name="start" value={formulario.start} onChange={handleChange} disabled={guardando}/>
                <span>a</span>
                <input type="time" name="end" value={formulario.end} onChange={handleChange} disabled={guardando}/>
              </div>
            </div>
          </div>

          <div className="agendar-fila">
            <div>
              <label>Cliente</label>
              <input name="client" value={formulario.client} onChange={handleChange} disabled={guardando}/>
            </div>
            <div>
              <label>Teléfono</label>
              <input name="clientPhone" value={formulario.clientPhone} onChange={handleChange} disabled={guardando}/>
            </div>
          </div>

          <div className="agendar-fila" style={{ gridColumn: 'span 2' }}>
            <label>Comentario</label>
            <input name="comentario" value={formulario.comentario} onChange={handleChange} disabled={guardando}/>
          </div>

          <label>Color *</label>
          <div className="agendar-colores">
            {coloresDisponibles.map((color, i) => (
              <span key={i} className={`agendar-color ${formulario.color===color?'seleccionado':''}`} style={{backgroundColor: color}} onClick={()=>handleColorSelect(color)}/>
            ))}
          </div>

          {mensaje && <div style={{color: mensaje.includes('Error')?'red':'green', fontWeight:'bold', textAlign:'center'}}>{mensaje}</div>}

          <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
            <button onClick={handleGuardar} disabled={guardando}>
              <FaSave /> {guardando ? 'Guardando...' : modo==='editar'?'Guardar cambios':'Guardar cita'}
            </button>
            {modo==='editar' &&
              <button onClick={handleEliminar} disabled={guardando} style={{backgroundColor:'#ff4d4f', color:'white'}}>
                <FaTimes /> Eliminar
              </button>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCita;
