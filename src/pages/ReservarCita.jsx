import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/reservarCita.css";

const coloresDisponibles = [
  "#f16b74",
  "#56fa47",
  "#f58225",
  "#bbf7d0",
  "#00fca8",
  "#47f183",
  "#58b4f1",
  "#3dc2ff",
];

const API = "https://mi-api-atempo.onrender.com";

const safeUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("https")) return url;
  return url.replace("http://", "https://");
};

const ReservarCita = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const clienteUser = JSON.parse(localStorage.getItem("clienteUser") || "null");
  const clienteToken = localStorage.getItem("clienteToken");

  const [vista, setVista] = useState("reservar");
  const [empresa, setEmpresa] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [misCitas, setMisCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [citasOcupadas, setCitasOcupadas] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    id_encargado: null,
    encargado: "",
    titulo: "",
    fecha: "",
    hora_inicio: "",
    hora_final: "",
    nombre_cliente: clienteUser?.nombre || "",
    numero_cliente: clienteUser?.telefono || "",
    motivo: "",
    color: coloresDisponibles[0],
  });

  useEffect(() => {
    if (!clienteToken) navigate(`/login-cliente/${slug}`);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/publico/${slug}`)
      .then((r) => r.json())
      .then((d) => setEmpresa(d))
      .catch(() => setEmpresa(null));

    fetch(`${API}/api/publico/${slug}/personas`)
      .then((r) => r.json())
      .then((d) => {
        setPersonas(Array.isArray(d) ? d : []);
        setLoadingPersonas(false);
      })
      .catch(() => setLoadingPersonas(false));
  }, [slug]);

  useEffect(() => {
    const { id_encargado, fecha } = formulario;

    if (!id_encargado || !fecha) {
      setCitasOcupadas([]);
      return;
    }

    fetch(
      `${API}/api/publico/${slug}/citas-ocupadas?id_persona=${id_encargado}&fecha=${fecha}`
    )
      .then((r) => r.json())
      .then((d) => setCitasOcupadas(Array.isArray(d) ? d : []))
      .catch(() => setCitasOcupadas([]));
  }, [formulario.id_encargado, formulario.fecha]);

  const cargarMisCitas = async () => {
    setLoadingCitas(true);

    try {
      const res = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: { Authorization: `Bearer ${clienteToken}` },
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
    if (vista === "mis-citas") cargarMisCitas();
  }, [vista]);

  const handleChange = (e) => {
    setFormulario((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const hayConflictoHorario = (hora_inicio, hora_final) => {
    if (!hora_inicio || !hora_final) return false;

    return citasOcupadas.some(
      (c) => hora_inicio < c.hora_final && hora_final > c.hora_inicio
    );
  };

  const horaFinalValida = () => {
    const { hora_inicio, hora_final } = formulario;
    if (!hora_inicio || !hora_final) return true;
    return hora_final > hora_inicio;
  };

  const handleGuardar = async () => {
    const {
      id_encargado,
      titulo,
      fecha,
      hora_inicio,
      hora_final,
      nombre_cliente,
      numero_cliente,
    } = formulario;

    if (
      !id_encargado ||
      !titulo ||
      !fecha ||
      !hora_inicio ||
      !hora_final ||
      !nombre_cliente ||
      !numero_cliente
    ) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (!horaFinalValida()) {
      setMensaje("Hora final debe ser mayor");
      return;
    }

    if (hayConflictoHorario(hora_inicio, hora_final)) {
      setMensaje("Horario ocupado");
      return;
    }

    setGuardando(true);

    try {
      const url = citaEditando
        ? `${API}/api/cliente-auth/editar-cita/${citaEditando.id_cita}`
        : `${API}/api/publico/${slug}/citas`;

      const method = citaEditando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clienteToken}`,
        },
        body: JSON.stringify({
          id_persona: formulario.id_encargado,
          id_cliente_registro: clienteUser?.id_cliente,
          ...formulario,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.error);
        return;
      }

      if (citaEditando) {
        setVista("mis-citas");
        cargarMisCitas();
      } else {
        setExito(true);
      }

      resetFormulario();
    } catch {
      setMensaje("Error conexión");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (cita) => {
    setCitaEditando(cita);

    setFormulario({
      id_encargado: cita.id_persona,
      encargado: cita.nombre_encargado,
      titulo: cita.titulo,
      fecha: cita.fecha,
      hora_inicio: cita.hora_inicio.slice(0, 5),
      hora_final: cita.hora_final.slice(0, 5),
      nombre_cliente: cita.nombre_cliente,
      numero_cliente: cita.numero_cliente,
      motivo: cita.motivo,
      color: cita.color || coloresDisponibles[0],
    });

    setVista("reservar");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelar = async (cita) => {
    const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
    const horasRestantes = (citaDate - new Date()) / (1000 * 60 * 60);

    if (horasRestantes < 3) {
      alert("Solo puedes cancelar con 3 horas de anticipación");
      return;
    }

    if (!window.confirm("¿Cancelar cita?")) return;

    try {
      const res = await fetch(
        `${API}/api/cliente-auth/cancelar-cita/${cita.id_cita}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${clienteToken}` },
        }
      );

      if (res.ok) cargarMisCitas();
    } catch {
      alert("Error conexión");
    }
  };

  const resetFormulario = () => {
    setCitaEditando(null);
    setExito(false);

    setFormulario({
      id_encargado: null,
      encargado: "",
      titulo: "",
      fecha: "",
      hora_inicio: "",
      hora_final: "",
      nombre_cliente: clienteUser?.nombre || "",
      numero_cliente: clienteUser?.telefono || "",
      motivo: "",
      color: coloresDisponibles[0],
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteUser");
    navigate(`/login-cliente/${slug}`);
  };

  if (!empresa) return <div className="rc-loading">Cargando...</div>;

  return (
    <div className="rc-container">
      <div className="rc-card">

        {/* HEADER */}
        <div className="rc-header">

          {empresa?.logo_url ? (
            <img
              src={safeUrl(empresa.logo_url)}
              className="rc-logo"
              alt="logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="rc-logo-placeholder">
              {empresa.nombre_empresa?.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="rc-empresa">{empresa.nombre_empresa}</h1>

          <p>
            Hola <strong>{clienteUser?.nombre}</strong>
          </p>

          <div className="rc-tabs">
            <button
              onClick={() => {
                resetFormulario();
                setVista("reservar");
              }}
            >
              Agendar
            </button>

            <button onClick={() => setVista("mis-citas")}>
              Mis citas
            </button>

            <button onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>

        {/* MIS CITAS */}
        {vista === "mis-citas" && (
          <div className="rc-mis-citas">
            {loadingCitas ? (
              <p>Cargando...</p>
            ) : misCitas.length === 0 ? (
              <p>No tienes citas</p>
            ) : (
              misCitas.map((cita) => {
                const citaDate = new Date(`${cita.fecha}T${cita.hora_inicio}`);
                const pasada = citaDate < new Date();
                const horasRestantes =
                  (citaDate - new Date()) / (1000 * 60 * 60);

                const puedeEditar = !pasada && horasRestantes >= 3;

                return (
                  <div
                    key={cita.id_cita}
                    className={`rc-cita-card ${pasada ? "rc-cita-pasada" : ""
                      }`}
                    style={{
                      borderLeft: `4px solid ${cita.color || "#3b82f6"}`,
                      cursor: puedeEditar ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (puedeEditar) handleEditar(cita);
                    }}
                  >
                    <strong>{cita.titulo}</strong>

                    <p>
                      📅 {cita.fecha} ⏰{" "}
                      {cita.hora_inicio.slice(0, 5)} -{" "}
                      {cita.hora_final.slice(0, 5)}
                    </p>

                    {cita.nombre_encargado && (
                      <p>👤 {cita.nombre_encargado}</p>
                    )}

                    {!pasada && puedeEditar && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="rc-btn-editar"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditar(cita);
                          }}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          className="rc-btn-cancelar"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelar(cita);
                          }}
                        >
                          🗑 Cancelar
                        </button>
                      </div>
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