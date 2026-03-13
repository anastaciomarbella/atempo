import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/reservarCita.css";

const API = "https://mi-api-atempo.onrender.com";

const ReservarCita = () => {

  const { slug } = useParams();
  const navigate = useNavigate();

  const clienteToken = localStorage.getItem("clienteToken");

  const [misCitas, setMisCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  const [servicios, setServicios] = useState([]);
  const [personas, setPersonas] = useState([]);

  const [formData, setFormData] = useState({
    id_servicio: "",
    id_persona: "",
    fecha: "",
    hora: ""
  });

  // =========================
  // VALIDAR SESION
  // =========================

  useEffect(() => {
    if (!clienteToken) {
      navigate(`/login-cliente/${slug}`);
    }
  }, [clienteToken, slug, navigate]);

  // =========================
  // CARGAR SERVICIOS
  // =========================

  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API}/api/publico/servicios/${slug}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setServicios(data);
      }

    } catch (error) {
      console.error("Error cargando servicios", error);
    }
  };

  // =========================
  // CARGAR PERSONAS
  // =========================

  const cargarPersonas = async () => {
    try {

      const res = await fetch(`${API}/api/personas`, {
        headers: {
          Authorization: `Bearer ${clienteToken}`
        }
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPersonas(data);
      }

    } catch (error) {
      console.error("Error cargando personas", error);
    }
  };

  // =========================
  // CARGAR MIS CITAS
  // =========================

  const cargarMisCitas = async () => {

    if (!clienteToken) return;

    setLoadingCitas(true);

    try {

      const res = await fetch(`${API}/api/cliente-auth/mis-citas`, {
        headers: {
          Authorization: `Bearer ${clienteToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 401) {
        console.warn("Token expirado");

        localStorage.removeItem("clienteToken");
        localStorage.removeItem("clienteUser");

        navigate(`/login-cliente/${slug}`);
        return;
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setMisCitas(data);
      } else {
        setMisCitas([]);
      }

    } catch (error) {

      console.error("Error cargando citas", error);
      setMisCitas([]);

    } finally {
      setLoadingCitas(false);
    }
  };

  // =========================
  // LOAD INICIAL
  // =========================

  useEffect(() => {
    cargarServicios();
    cargarPersonas();
    cargarMisCitas();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

  };

  // =========================
  // RESERVAR CITA
  // =========================

  const handleGuardar = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(`${API}/api/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clienteToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al reservar");
        return;
      }

      alert("Cita reservada");

      cargarMisCitas();

    } catch (error) {
      console.error(error);
      alert("Error al reservar cita");
    }
  };

  // =========================
  // CANCELAR CITA
  // =========================

  const cancelarCita = async (id) => {

    if (!window.confirm("¿Cancelar cita?")) return;

    try {

      const res = await fetch(`${API}/api/cliente-auth/cancelar-cita/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${clienteToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        alert("No se pudo cancelar");
        return;
      }

      cargarMisCitas();

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="reservar-container">

      <h2>Reservar cita</h2>

      <form onSubmit={handleGuardar} className="form-reserva">

        <select
          name="id_servicio"
          value={formData.id_servicio}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar servicio</option>

          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre}
            </option>
          ))}

        </select>

        <select
          name="id_persona"
          value={formData.id_persona}
          onChange={handleChange}
          required
        >

          <option value="">Seleccionar persona</option>

          {personas.map((p) => (
            <option key={p.id_persona} value={p.id_persona}>
              {p.nombre}
            </option>
          ))}

        </select>

        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Reservar
        </button>

      </form>

      <h3>Mis citas</h3>

      {loadingCitas ? (
        <p>Cargando...</p>
      ) : (

        <div className="mis-citas">

          {misCitas.length === 0 && (
            <p>No tienes citas</p>
          )}

          {misCitas.map((cita) => (

            <div key={cita.id_cita} className="cita-card">

              <p><b>Servicio:</b> {cita.servicio}</p>
              <p><b>Persona:</b> {cita.persona}</p>
              <p><b>Fecha:</b> {cita.fecha}</p>
              <p><b>Hora:</b> {cita.hora}</p>

              <button
                onClick={() => cancelarCita(cita.id_cita)}
              >
                Cancelar
              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default ReservarCita;
