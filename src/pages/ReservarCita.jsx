import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './reservarCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0',
  '#00fca8', '#47f183', '#58b4f1', '#3dc2ff',
];

const API = 'https://mi-api-atempo.onrender.com';

const ReservarCita = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const clienteUser = JSON.parse(localStorage.getItem('clienteUser') || 'null');
  const clienteToken = localStorage.getItem('clienteToken');

  const [vista, setVista] = useState('reservar');
  const [empresa, setEmpresa] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [exito, setExito] = useState(false);
  const [mostrarEncargados, setMostrarEncargados] = useState(false);
  const [misCitas, setMisCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const [formulario, setFormulario] = useState({
    id_encargado: null,
    encargado: '',
    titulo: '',
    fecha: '',
    hora_inicio: '',
    hora_final: '',
    nombre_cliente: clienteUser?.nombre || '',
    numero_cliente: clienteUser?.telefono || '',
    motivo: '',
    color: coloresDisponibles[0],
  });

  useEffect(() => {
    if (!clienteToken) navigate(`/login-cliente/${slug}`);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/publico/${slug}`)
      .then(r => r.json())
      .then(d => setEmpresa(d))
      .catch(() => setEmpresa(null));

    fetch(`${API}/api/publico/${slug}/personas`)
      .then(r => r.json())
      .then(d => setPersonas(Array.isArray(d) ? d : []))
      .catch(() => setPersonas([]));
  }, [slug]);

  const cargarMisCitas = async () => {
    setLoadingCitas(true);
    try {
      const res = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: { Authorization: `Bearer ${clienteToken}` }
      });
      const data = await res.json();
      setMisCitas(Array.isArray(data) ? data : []);
    } catch {
      setMisCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    if (vista === 'mis-citas') cargarMisCitas();
  }, [vista]);

  const handleChange = e => {
    setFormulario(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMensaje('');
  };

  const handleCancelar = async (cita) => {
    const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const minutos = (citaDate - new Date()) / 60000;
    if (minutos < 30) {
      alert('Solo puedes cancelar con al menos 30 minutos de anticipación');
      return;
    }
    if (!window.confirm('¿Cancelar esta cita?')) return;
    try {
      const res = await fetch(`${API}/api/cliente-auth/cancelar-cita/${cita.id_cita}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${clienteToken}` }
      });
      if (res.ok) cargarMisCitas();
      else alert('Error al cancelar la cita');
    } catch {
      alert('Error de conexión');
    }
  };

  const handleGuardar = async () => {
    const { id_encargado, titulo, fecha, hora_inicio, hora_final, nombre_cliente, numero_cliente } = formulario;
    if (!id_encargado || !titulo || !fecha || !hora_inicio || !hora_final || !nombre_cliente || !numero_cliente) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${API}/api/publico/${slug}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: formulario.id_encargado,
          id_cliente_registro: clienteUser?.id_cliente,
          titulo: formulario.titulo,
          fecha: formulario.fecha,
          hora_inicio: formulario.hora_inicio,
          hora_final: formulario.hora_final,
          nombre_cliente: formulario.nombre_cliente,
          numero_cliente: formulario.numero_cliente,
          motivo: formulario.motivo,
          color: formulario.color,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMensaje(data.error || 'Error al agendar'); return; }
      setExito(true);
    } catch {
      setMensaje('Error de conexión');
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteUser');
    navigate(`/login-cliente/${slug}`);
  };

  if (!empresa) return <div className="rc-loading">Cargando...</div>;

  if (exito) return (
    <div className="rc-exito">
      {empresa.logo_url && <img src={empresa.logo_url} alt="logo" className="rc-exito-logo" />}
      <h2>{empresa.nombre_empresa}</h2>
      <div className="rc-exito-icono">✅</div>
      <h3>¡Cita agendada con éxito!</h3>
      <p>Te esperamos el <strong>{formulario.fecha}</strong> a las <strong>{formulario.hora_inicio}</strong></p>
      <div className="rc-exito-btns">
        <button className="rc-btn" onClick={() => {
          setExito(false);
          setFormulario(prev => ({
            ...prev, id_encargado: null, encargado: '', titulo: '',
            fecha: '', hora_inicio: '', hora_final: '', motivo: '',
            color: coloresDisponibles[0]
          }));
        }}>
          Agendar otra cita
        </button>
        <button className="rc-btn-outline" onClick={() => { setExito(false); setVista('mis-citas'); }}>
          Ver mis citas
        </button>
      </div>
    </div>
  );

  return (
    <div className="rc-container">
      <div className="rc-card">

        {/* HEADER */}
        <div className="rc-header">
          {empresa.logo_url
            ? <img src={empresa.logo_url} alt="logo" className="rc-logo" />
            : <div className="rc-logo-placeholder">{empresa.nombre_empresa?.charAt(0).toUpperCase()}</div>
          }
          <h1 className="rc-empresa">{empresa.nombre_empresa}</h1>
          <p className="rc-bienvenida">Hola, <strong>{clienteUser?.nombre}</strong> 👋</p>

          <div className="rc-tabs">
            <button className={vista === 'reservar' ? 'rc-tab rc-tab-activo' : 'rc-tab'} onClick={() => setVista('reservar')}>
              📅 Agendar cita
            </button>
            <button className={vista === 'mis-citas' ? 'rc-tab rc-tab-activo' : 'rc-tab'} onClick={() => setVista('mis-citas')}>
              📋 Mis citas
            </button>
            <button className="rc-tab rc-tab-logout" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>

        {/* ===== VISTA: RESERVAR ===== */}
        {vista === 'reservar' && (
          <div className="rc-form">

            <div className="rc-field">
              <label>Servicio *</label>
              <input name="titulo" placeholder="Ej: Corte de cabello" value={formulario.titulo} onChange={handleChange} />
            </div>

            {/* ENCARGADOS */}
            <div className="rc-field">
              <label>Selecciona un encargado *</label>
              <div className="rc-encargados-grid">
                {personas.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>No hay encargados disponibles</p>
                ) : (
                  personas.map(p => (
                    <div
                      key={p.id_persona}
                      className={`rc-encargado-card ${formulario.id_encargado === p.id_persona ? 'rc-encargado-activo' : ''}`}
                      onClick={() => setFormulario(prev => ({ ...prev, id_encargado: p.id_persona, encargado: p.nombre }))}
                    >
                      <div className="rc-encargado-avatar">
                        {p.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <span>{p.nombre}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rc-field">
              <label>Fecha *</label>
              <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="rc-row">
              <div className="rc-field">
                <label>Hora inicio *</label>
                <input type="time" name="hora_inicio" value={formulario.hora_inicio} onChange={handleChange} />
              </div>
              <div className="rc-field">
                <label>Hora fin *</label>
                <input type="time" name="hora_final" value={formulario.hora_final} onChange={handleChange} />
              </div>
            </div>

            <div className="rc-field">
              <label>Tu nombre *</label>
              <input name="nombre_cliente" value={formulario.nombre_cliente} onChange={handleChange} />
            </div>

            <div className="rc-field">
              <label>Tu teléfono *</label>
              <input name="numero_cliente" value={formulario.numero_cliente} onChange={handleChange} />
            </div>

            <div className="rc-field">
              <label>Comentario</label>
              <input name="motivo" placeholder="Opcional" value={formulario.motivo} onChange={handleChange} />
            </div>

            <div className="rc-field">
              <label>Color de tu cita</label>
              <div className="rc-colores">
                {coloresDisponibles.map(c => (
                  <span key={c}
                    className={`rc-color ${formulario.color === c ? 'rc-color-activo' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormulario(prev => ({ ...prev, color: c }))}
                  />
                ))}
              </div>
            </div>

            {mensaje && <p className="rc-mensaje-error">{mensaje}</p>}

            <button className="rc-btn" onClick={handleGuardar} disabled={guardando}>
              {guardando ? 'Agendando...' : 'Confirmar cita'}
            </button>
          </div>
        )}

        {/* ===== VISTA: MIS CITAS ===== */}
        {vista === 'mis-citas' && (
          <div className="rc-mis-citas">
            {loadingCitas ? (
              <p className="rc-loading-txt">Cargando citas...</p>
            ) : misCitas.length === 0 ? (
              <div className="rc-vacio">
                <p>No tienes citas registradas</p>
                <button className="rc-btn" onClick={() => setVista('reservar')}>
                  Agendar mi primera cita
                </button>
              </div>
            ) : (
              misCitas.map(cita => {
                const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
                const pasada = citaDate < new Date();
                return (
                  <div key={cita.id_cita}
                    className={`rc-cita-card ${pasada ? 'rc-cita-pasada' : ''}`}
                    style={{ borderLeft: `4px solid ${cita.color || '#3b82f6'}` }}>
                    <div className="rc-cita-header">
                      <strong>{cita.titulo}</strong>
                      <span className={`rc-badge ${pasada ? 'rc-badge-pasada' : 'rc-badge-proxima'}`}>
                        {pasada ? 'Pasada' : 'Próxima'}
                      </span>
                    </div>
                    <p>📅 {cita.fecha} · ⏰ {cita.hora_inicio?.slice(0, 5)} – {cita.hora_final?.slice(0, 5)}</p>
                    {cita.motivo && <p>💬 {cita.motivo}</p>}
                    {!pasada && (
                      <button className="rc-btn-cancelar" onClick={() => handleCancelar(cita)}>
                        Cancelar cita
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservarCita;