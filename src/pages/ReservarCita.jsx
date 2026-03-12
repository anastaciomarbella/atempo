import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/reservarCita.css';

const coloresDisponibles = [
  '#f16b74', '#56fa47', '#f58225', '#bbf7d0',
  '#00fca8', '#47f183', '#58b4f1', '#3dc2ff',
];

const API     = 'https://mi-api-atempo.onrender.com';
const safeUrl = (url) => url?.replace('http://', 'https://') || '';

const ReservarCita = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();

  const clienteUser  = JSON.parse(localStorage.getItem('clienteUser') || 'null');
  const clienteToken = localStorage.getItem('clienteToken');

  const [vista, setVista]                   = useState('reservar');
  const [empresa, setEmpresa]               = useState(null);
  const [personas, setPersonas]             = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [servicios, setServicios]           = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [guardando, setGuardando]           = useState(false);
  const [mensaje, setMensaje]               = useState('');
  const [exito, setExito]                   = useState(false);
  const [misCitas, setMisCitas]             = useState([]);
  const [loadingCitas, setLoadingCitas]     = useState(false);
  const [citasOcupadas, setCitasOcupadas]   = useState([]);
  const [citaEditando, setCitaEditando]     = useState(null);

  const [formulario, setFormulario] = useState({
    id_encargado:   null,
    encargado:      '',
    titulo:         '',
    fecha:          '',
    hora_inicio:    '',
    hora_final:     '',
    nombre_cliente: clienteUser?.nombre   || '',
    numero_cliente: clienteUser?.telefono || '',
    motivo:         '',
    color:          coloresDisponibles[0],
  });

  useEffect(() => {
    if (!clienteToken) navigate(`/login-cliente/${slug}`);
  }, []);

  useEffect(() => {
    // Empresa
    fetch(`${API}/api/publico/${slug}`)
      .then(r => r.json()).then(d => setEmpresa(d)).catch(() => setEmpresa(null));

    // Empleados
    setLoadingPersonas(true);
    fetch(`${API}/api/publico/${slug}/personas`)
      .then(r => r.json())
      .then(d => { setPersonas(Array.isArray(d) ? d : []); setLoadingPersonas(false); })
      .catch(() => { setPersonas([]); setLoadingPersonas(false); });

    // Servicios
    setLoadingServicios(true);
    fetch(`${API}/api/publico/${slug}/servicios`)
      .then(r => r.json())
      .then(d => { setServicios(Array.isArray(d) ? d : []); setLoadingServicios(false); })
      .catch(() => { setServicios([]); setLoadingServicios(false); });
  }, [slug]);

  useEffect(() => {
    const { id_encargado, fecha } = formulario;
    if (!id_encargado || !fecha) { setCitasOcupadas([]); return; }
    fetch(`${API}/api/publico/${slug}/citas-ocupadas?id_persona=${id_encargado}&fecha=${fecha}`)
      .then(r => r.json())
      .then(d => setCitasOcupadas(Array.isArray(d) ? d : []))
      .catch(() => setCitasOcupadas([]));
  }, [formulario.id_encargado, formulario.fecha]);

  const cargarMisCitas = async () => {
    setLoadingCitas(true);
    try {
      const res  = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: { Authorization: `Bearer ${clienteToken}` }
      });
      const data = await res.json();
      setMisCitas(Array.isArray(data) ? data : []);
    } catch { setMisCitas([]); }
    finally  { setLoadingCitas(false); }
  };

  useEffect(() => { if (vista === 'mis-citas') cargarMisCitas(); }, [vista]);

  const handleChange = e => {
    setFormulario(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMensaje('');
  };

  // Seleccionar servicio como tarjeta
  const handleSeleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    // Calcular hora_final si hay hora_inicio y duracion
    let hora_final = formulario.hora_final;
    if (formulario.hora_inicio && servicio.duracion) {
      const [hh, mm] = formulario.hora_inicio.split(':').map(Number);
      const totalMin = hh * 60 + mm + Number(servicio.duracion);
      const h = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
      const m = String(totalMin % 60).padStart(2, '0');
      hora_final = `${h}:${m}`;
    }
    setFormulario(prev => ({ ...prev, titulo: servicio.nombre, hora_final }));
    setMensaje('');
  };

  const hayConflictoHorario = (hi, hf) => {
    if (!hi || !hf) return false;
    return citasOcupadas.some(c => hi < c.hora_final && hf > c.hora_inicio);
  };

  const horaFinalValida = () => {
    const { hora_inicio, hora_final } = formulario;
    if (!hora_inicio || !hora_final) return true;
    return hora_final > hora_inicio;
  };

  // Recalcular hora_final cuando cambia hora_inicio (si hay servicio seleccionado)
  const handleHoraInicioChange = (e) => {
    const hora_inicio = e.target.value;
    let hora_final    = formulario.hora_final;
    if (hora_inicio && servicioSeleccionado?.duracion) {
      const [hh, mm] = hora_inicio.split(':').map(Number);
      const totalMin = hh * 60 + mm + Number(servicioSeleccionado.duracion);
      const h = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
      const m = String(totalMin % 60).padStart(2, '0');
      hora_final = `${h}:${m}`;
    }
    setFormulario(prev => ({ ...prev, hora_inicio, hora_final }));
    setMensaje('');
  };

  const handleGuardar = async () => {
    const { id_encargado, titulo, fecha, hora_inicio, hora_final, nombre_cliente, numero_cliente } = formulario;
    if (!id_encargado || !titulo || !fecha || !hora_inicio || !hora_final || !nombre_cliente || !numero_cliente) {
      setMensaje('Por favor completa todos los campos obligatorios.'); return;
    }
    if (!horaFinalValida()) { setMensaje('La hora de fin debe ser mayor a la hora de inicio.'); return; }
    if (hayConflictoHorario(hora_inicio, hora_final)) {
      setMensaje(`${formulario.encargado} ya tiene una cita en ese horario.`); return;
    }
    setGuardando(true);
    try {
      const url    = citaEditando
        ? `${API}/api/cliente-auth/editar-cita/${citaEditando.id_cita}`
        : `${API}/api/publico/${slug}/citas`;
      const method = citaEditando ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clienteToken}` },
        body: JSON.stringify({
          id_persona:          formulario.id_encargado,
          id_cliente_registro: clienteUser?.id_cliente,
          titulo:              formulario.titulo,
          fecha:               formulario.fecha,
          hora_inicio:         formulario.hora_inicio,
          hora_final:          formulario.hora_final,
          nombre_cliente:      formulario.nombre_cliente,
          numero_cliente:      formulario.numero_cliente,
          motivo:              formulario.motivo,
          color:               formulario.color,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMensaje(data.error || 'Error al guardar'); return; }
      if (citaEditando) {
        setCitaEditando(null); setVista('mis-citas'); cargarMisCitas(); resetFormulario();
      } else { setExito(true); }
    } catch { setMensaje('Error de conexión'); }
    finally  { setGuardando(false); }
  };

  const handleEditar = (cita) => {
    setCitaEditando(cita);
    setFormulario({
      id_encargado:   cita.id_cliente,
      encargado:      cita.nombre_encargado || '',
      titulo:         cita.titulo           || '',
      fecha:          cita.fecha            || '',
      hora_inicio:    cita.hora_inicio?.slice(0, 5) || '',
      hora_final:     cita.hora_final?.slice(0, 5)  || '',
      nombre_cliente: cita.nombre_cliente   || '',
      numero_cliente: cita.numero_cliente   || '',
      motivo:         cita.motivo           || '',
      color:          cita.color            || coloresDisponibles[0],
    });
    setVista('reservar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = async (cita) => {
    const horasRestantes = (new Date(`${cita.fecha}T${cita.hora_inicio}`) - new Date()) / (1000 * 60 * 60);
    if (horasRestantes < 3) { alert('Solo puedes cancelar con al menos 3 horas de anticipación.'); return; }
    if (!window.confirm('¿Cancelar esta cita?')) return;
    try {
      const res = await fetch(`${API}/api/cliente-auth/cancelar-cita/${cita.id_cita}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${clienteToken}` }
      });
      if (res.ok) cargarMisCitas(); else alert('Error al cancelar la cita');
    } catch { alert('Error de conexión'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('clienteToken');
    localStorage.removeItem('clienteUser');
    navigate(`/login-cliente/${slug}`);
  };

  const resetFormulario = () => {
    setExito(false); setCitaEditando(null); setCitasOcupadas([]);
    setServicioSeleccionado(null);
    setFormulario({
      id_encargado: null, encargado: '', titulo: '', fecha: '',
      hora_inicio: '', hora_final: '',
      nombre_cliente: clienteUser?.nombre   || '',
      numero_cliente: clienteUser?.telefono || '',
      motivo: '', color: coloresDisponibles[0],
    });
  };

  const conflictoEnVivo = hayConflictoHorario(formulario.hora_inicio, formulario.hora_final);
  const horaInvalida    = !horaFinalValida();

  if (!empresa) return <div className="rc-loading">Cargando...</div>;

  if (exito) return (
    <div className="rc-exito">
      {empresa.logo_url && <img src={safeUrl(empresa.logo_url)} alt="logo" className="rc-exito-logo" />}
      <h2>{empresa.nombre_empresa}</h2>
      <div className="rc-exito-icono">✅</div>
      <h3>¡Cita agendada con éxito!</h3>
      <p>Te esperamos el <strong>{formulario.fecha}</strong> a las <strong>{formulario.hora_inicio}</strong></p>
      <p style={{ marginTop: 4, fontSize: 13 }}>con <strong>{formulario.encargado}</strong></p>
      <div className="rc-exito-btns">
        <button className="rc-btn" onClick={resetFormulario}>Agendar otra cita</button>
        <button className="rc-btn-outline" onClick={() => { resetFormulario(); setVista('mis-citas'); }}>
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
            ? <img src={safeUrl(empresa.logo_url)} alt="logo" className="rc-logo" />
            : <div className="rc-logo-placeholder">{empresa.nombre_empresa?.charAt(0).toUpperCase()}</div>
          }
          <h1 className="rc-empresa">{empresa.nombre_empresa}</h1>
          <p className="rc-bienvenida">Hola, <strong>{clienteUser?.nombre}</strong> 👋</p>
          <div className="rc-tabs">
            <button className={vista === 'reservar' ? 'rc-tab rc-tab-activo' : 'rc-tab'}
              onClick={() => { resetFormulario(); setVista('reservar'); }}>
              📅 {citaEditando ? 'Editando cita' : 'Agendar cita'}
            </button>
            <button className={vista === 'mis-citas' ? 'rc-tab rc-tab-activo' : 'rc-tab'}
              onClick={() => setVista('mis-citas')}>
              📋 Mis citas
            </button>
            <button className="rc-tab rc-tab-logout" onClick={handleLogout}>Salir</button>
          </div>
        </div>

        {/* ===== VISTA: RESERVAR ===== */}
        {vista === 'reservar' && (
          <div className="rc-form">

            {citaEditando && (
              <div style={{
                background: '#fef3c7', border: '1px solid #f59e0b',
                borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#92400e'
              }}>
                ✏️ Estás editando una cita.{' '}
                <button onClick={resetFormulario}
                  style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', textDecoration: 'underline' }}>
                  Cancelar edición
                </button>
              </div>
            )}

            {/* ── SELECCIÓN DE SERVICIO ── */}
            <div className="rc-field">
              <label>Selecciona un servicio *</label>

              {loadingServicios && (
                <div className="rc-servicios-loading">
                  {[1,2,3].map(i => <div key={i} className="rc-servicio-skeleton" />)}
                </div>
              )}

              {!loadingServicios && servicios.length === 0 && (
                <div className="rc-empleados-vacio">
                  <span>🛎️</span>
                  <p>Este negocio aún no tiene servicios registrados.</p>
                </div>
              )}

              {!loadingServicios && servicios.length > 0 && (
                <div className="rc-servicios-grid">
                  {servicios.map(s => {
                    const seleccionado = servicioSeleccionado?.id_servicio === s.id_servicio;
                    return (
                      <button
                        key={s.id_servicio}
                        type="button"
                        className={`rc-servicio-card ${seleccionado ? 'rc-servicio-seleccionado' : ''}`}
                        onClick={() => handleSeleccionarServicio(s)}
                      >
                        {/* Imagen o placeholder */}
                        <div className="rc-servicio-img-wrap">
                          {s.imagen_url
                            ? <img src={safeUrl(s.imagen_url)} alt={s.nombre} className="rc-servicio-img" />
                            : <div className="rc-servicio-img-placeholder">✂️</div>
                          }
                          {seleccionado && <div className="rc-servicio-check">✓</div>}
                        </div>
                        {/* Info */}
                        <div className="rc-servicio-info">
                          <span className="rc-servicio-nombre">{s.nombre}</span>
                          <div className="rc-servicio-meta">
                            {s.precio  && <span className="rc-servicio-precio">${parseFloat(s.precio).toFixed(2)}</span>}
                            {s.duracion && <span className="rc-servicio-duracion">⏱ {s.duracion} min</span>}
                          </div>
                          {s.descripcion && (
                            <span className="rc-servicio-desc">{s.descripcion}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {servicioSeleccionado && (
                <p className="rc-empleado-resumen">
                  ✅ Seleccionaste: <strong>{servicioSeleccionado.nombre}</strong>
                  {servicioSeleccionado.duracion && ` · ${servicioSeleccionado.duracion} min`}
                </p>
              )}
            </div>

            {/* ── EMPLEADO ── */}
            <div className="rc-field">
              <label>¿Con quién quieres tu cita? *</label>
              {loadingPersonas && (
                <div className="rc-empleados-loading">
                  {[1,2,3].map(i => <div key={i} className="rc-empleado-skeleton" />)}
                </div>
              )}
              {!loadingPersonas && personas.length === 0 && (
                <div className="rc-empleados-vacio">
                  <span>👥</span>
                  <p>Esta empresa aún no tiene encargados registrados.</p>
                </div>
              )}
              {!loadingPersonas && personas.length > 0 && (
                <div className="rc-empleados-grid">
                  {personas.map(p => {
                    const seleccionado = formulario.id_encargado === p.id_persona;
                    return (
                      <button key={p.id_persona} type="button"
                        className={`rc-empleado-card ${seleccionado ? 'rc-empleado-seleccionado' : ''}`}
                        onClick={() => {
                          setFormulario(prev => ({ ...prev, id_encargado: p.id_persona, encargado: p.nombre }));
                          setMensaje('');
                        }}>
                        <div className="rc-empleado-avatar"
                          style={{ background: `hsl(${(p.id_persona * 67) % 360}, 50%, 62%)` }}>
                          {p.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="rc-empleado-info">
                          <span className="rc-empleado-nombre">{p.nombre}</span>
                          {p.especialidad && <span className="rc-empleado-especialidad">{p.especialidad}</span>}
                        </div>
                        {seleccionado && <span className="rc-empleado-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              {formulario.encargado && (
                <p className="rc-empleado-resumen">✅ Seleccionaste a <strong>{formulario.encargado}</strong></p>
              )}
            </div>

            {/* ── FECHA ── */}
            <div className="rc-field">
              <label>Fecha *</label>
              <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            {citasOcupadas.length > 0 && formulario.fecha && (
              <div className="rc-horarios-ocupados">
                <p>⚠️ Horarios ocupados con <strong>{formulario.encargado}</strong> ese día:</p>
                <div className="rc-horarios-lista">
                  {citasOcupadas.map((c, i) => (
                    <span key={i} className="rc-horario-badge">
                      {c.hora_inicio?.slice(0,5)} – {c.hora_final?.slice(0,5)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── HORARIOS ── */}
            <div className="rc-row">
              <div className="rc-field">
                <label>Hora inicio *</label>
                <input type="time" name="hora_inicio" value={formulario.hora_inicio}
                  onChange={handleHoraInicioChange}
                  className={conflictoEnVivo ? 'rc-input-error' : ''} />
              </div>
              <div className="rc-field">
                <label>Hora fin *{servicioSeleccionado?.duracion ? ' (calculada)' : ''}</label>
                <input type="time" name="hora_final" value={formulario.hora_final}
                  onChange={handleChange}
                  className={conflictoEnVivo || horaInvalida ? 'rc-input-error' : ''}
                  readOnly={!!servicioSeleccionado?.duracion} />
              </div>
            </div>

            {conflictoEnVivo && <p className="rc-aviso-conflicto">⚠️ Horario ocupado. Elige otro horario.</p>}
            {horaInvalida    && <p className="rc-aviso-conflicto">⚠️ La hora de fin debe ser mayor a la de inicio.</p>}

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

            <button className="rc-btn" onClick={handleGuardar}
              disabled={guardando || conflictoEnVivo || horaInvalida}>
              {guardando ? 'Guardando...' : citaEditando ? '💾 Guardar cambios' : 'Confirmar cita'}
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
                <button className="rc-btn" onClick={() => setVista('reservar')}>Agendar mi primera cita</button>
              </div>
            ) : (
              misCitas.map(cita => {
                const citaDate       = new Date(`${cita.fecha}T${cita.hora_inicio}`);
                const pasada         = citaDate < new Date();
                const horasRestantes = (citaDate - new Date()) / (1000 * 60 * 60);
                const puedeModificar = !pasada && horasRestantes >= 3;
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
                    <p>📅 {cita.fecha} · ⏰ {cita.hora_inicio?.slice(0,5)} – {cita.hora_final?.slice(0,5)}</p>
                    {cita.nombre_encargado && <p>👤 {cita.nombre_encargado}</p>}
                    {cita.motivo && <p>💬 {cita.motivo}</p>}
                    {!pasada && (
                      puedeModificar ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="rc-btn-editar"   onClick={() => handleEditar(cita)}>✏️ Editar</button>
                          <button className="rc-btn-cancelar" onClick={() => handleCancelar(cita)}>🗑 Cancelar</button>
                        </div>
                      ) : (
                        <p className="rc-aviso-cancelar">🔒 Solo se puede modificar con 3+ horas de anticipación</p>
                      )
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
