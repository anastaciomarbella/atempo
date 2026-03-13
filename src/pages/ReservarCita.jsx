import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/reservarCita.css";

const API = "https://mi-api-atempo.onrender.com";

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

const safeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace("http://", "https://");
};

function formatearDuracion(duracion) {
  if (!duracion) return "";

  let total = 0;

  if (typeof duracion === "number") {
    total = duracion;
  }

  if (typeof duracion === "string") {
    if (duracion.includes(":")) {
      const [h, m] = duracion.split(":");
      total = parseInt(h) * 60 + parseInt(m);
    } else {
      total = parseInt(duracion) || 0;
    }
  }

  if (total <= 0) return "";

  const horas = Math.floor(total / 60);
  const minutos = total % 60;

  if (horas > 0 && minutos > 0) return `${horas} h ${minutos} min`;
  if (horas > 0) return `${horas} h`;

  return `${minutos} min`;
}

const ReservarCita = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const clienteUser = JSON.parse(localStorage.getItem("clienteUser") || "null");
  const clienteToken = localStorage.getItem("clienteToken");

  const [vista, setVista] = useState("reservar");

  const [empresa, setEmpresa] = useState(null);

  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);

  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  const [misCitas, setMisCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const [citasOcupadas, setCitasOcupadas] = useState([]);

  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);

  const [formulario, setFormulario] = useState({
    id_encargado: "",
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
    if (!clienteToken) {
      navigate(`/login-cliente/${slug}`);
    }
  }, [clienteToken, navigate, slug]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resEmpresa = await fetch(`${API}/api/publico/${slug}`);
        const empresaData = await resEmpresa.json();
        setEmpresa(empresaData);
      } catch {
        setEmpresa(null);
      }

      try {
        const resPersonas = await fetch(`${API}/api/publico/${slug}/personas`);
        const data = await resPersonas.json();
        setPersonas(Array.isArray(data) ? data : []);
      } catch {
        setPersonas([]);
      }

      setLoadingPersonas(false);

      try {
        const resServicios = await fetch(`${API}/api/publico/${slug}/servicios`);
        const data = await resServicios.json();
        setServicios(Array.isArray(data) ? data : []);
      } catch {
        setServicios([]);
      }

      setLoadingServicios(false);
    };

    cargarDatos();
  }, [slug]);

  useEffect(() => {
    if (!formulario.id_encargado || !formulario.fecha) {
      setCitasOcupadas([]);
      return;
    }

    const cargarCitas = async () => {
      try {
        const res = await fetch(
          `${API}/api/publico/${slug}/citas-ocupadas?id_persona=${formulario.id_encargado}&fecha=${formulario.fecha}`
        );

        const data = await res.json();
        setCitasOcupadas(Array.isArray(data) ? data : []);
      } catch {
        setCitasOcupadas([]);
      }
    };

    cargarCitas();
  }, [formulario.id_encargado, formulario.fecha, slug]);

  const cargarMisCitas = async () => {
    setLoadingCitas(true);

    try {
      const res = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: {
          Authorization: `Bearer ${clienteToken}`,
        },
      });

      if (!res.ok) {
        setMisCitas([]);
        setLoadingCitas(false);
        return;
      }

      const data = await res.json();
      setMisCitas(Array.isArray(data) ? data : []);
    } catch {
      setMisCitas([]);
    }

    setLoadingCitas(false);
  };

  useEffect(() => {
    if (vista === "mis-citas") {
      cargarMisCitas();
    }
  }, [vista]);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });

    setMensaje("");
    setExito(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("clienteToken");
    localStorage.removeItem("clienteUser");
    navigate(`/login-cliente/${slug}`);
  };

  const guardarCita = async (e) => {
    e.preventDefault();

    setGuardando(true);
    setMensaje("");
    setExito(false);

    try {
      const res = await fetch(`${API}/api/publico/${slug}/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.message || "Error al guardar cita");
        setGuardando(false);
        return;
      }

      setExito(true);

      setFormulario({
        ...formulario,
        fecha: "",
        hora_inicio: "",
        hora_final: "",
        motivo: "",
      });
    } catch {
      setMensaje("Error de conexión con el servidor");
    }

    setGuardando(false);
  };

  if (!empresa) {
    return <div className="rc-loading">Cargando...</div>;
  }

  return (
    <div className="rc-container">
      <div className="rc-card">
        <div className="rc-header">
          {empresa.logo_url ? (
            <img
              src={safeUrl(empresa.logo_url)}
              alt="logo"
              className="rc-logo"
            />
          ) : (
            <div className="rc-logo-placeholder">
              {empresa.nombre_empresa?.charAt(0)?.toUpperCase()}
            </div>
          )}

          <h1 className="rc-empresa">{empresa.nombre_empresa}</h1>

          <p className="rc-bienvenida">
            Hola, <strong>{clienteUser?.nombre}</strong>
          </p>

          <div className="rc-tabs">
            <button
              className={
                vista === "reservar" ? "rc-tab rc-tab-activo" : "rc-tab"
              }
              onClick={() => setVista("reservar")}
            >
              Agendar cita
            </button>

            <button
              className={
                vista === "mis-citas" ? "rc-tab rc-tab-activo" : "rc-tab"
              }
              onClick={() => setVista("mis-citas")}
            >
              Mis citas
            </button>

            <button className="rc-tab rc-tab-logout" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>

        {mensaje && <div className="rc-error">{mensaje}</div>}

        {exito && (
          <div className="rc-success">
            Tu cita fue reservada correctamente
          </div>
        )}

        {vista === "reservar" && (
          <form className="rc-form" onSubmit={guardarCita}>
            <input
              type="date"
              name="fecha"
              value={formulario.fecha}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="hora_inicio"
              value={formulario.hora_inicio}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="hora_final"
              value={formulario.hora_final}
              onChange={handleChange}
              required
            />

            <textarea
              name="motivo"
              placeholder="Motivo"
              value={formulario.motivo}
              onChange={handleChange}
            />

            <button disabled={guardando}>
              {guardando ? "Guardando..." : "Reservar cita"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservarCita;