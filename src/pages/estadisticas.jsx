import React, { useEffect, useState } from "react";
import "../styles/estadisticas.css";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaChartBar,
  FaSpinner,
} from "react-icons/fa";

const API = "https://mi-api-atempo.onrender.com";

const Estadisticas = () => {
  const token = localStorage.getItem("token");

  const [periodo, setPeriodo] = useState("dia"); // dia | semana | mes
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEstadisticas(periodo);
  }, [periodo]);

  const cargarEstadisticas = async (p) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/estadisticas?periodo=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setDatos(data);
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const periodos = [
    { key: "dia",    label: "Hoy",      icon: <FaCalendarDay /> },
    { key: "semana", label: "Semana",   icon: <FaCalendarWeek /> },
    { key: "mes",    label: "Mes",      icon: <FaCalendarAlt /> },
  ];

  // Calcular la barra más alta para normalizar
  const maxBarras = datos?.por_hora
    ? Math.max(...datos.por_hora.map(h => h.total), 1)
    : 1;

  return (
    <div className="est-container">

      {/* TÍTULO */}
      <div className="est-header">
        <FaChartBar className="est-header-icon" />
        <div>
          <h1 className="est-titulo">Estadísticas</h1>
          <p className="est-subtitulo">Resumen de citas y servicios</p>
        </div>
      </div>

      {/* SELECTOR DE PERIODO */}
      <div className="est-tabs">
        {periodos.map(p => (
          <button
            key={p.key}
            className={`est-tab ${periodo === p.key ? "est-tab-activo" : ""}`}
            onClick={() => setPeriodo(p.key)}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {/* ESTADOS */}
      {loading && (
        <div className="est-loading">
          <FaSpinner className="est-spinner" />
          <span>Cargando estadísticas...</span>
        </div>
      )}

      {error && (
        <div className="est-error">
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && datos && (
        <>
          {/* TARJETAS PRINCIPALES */}
          <div className="est-cards">
            <div className="est-card est-card-citas">
              <span className="est-card-numero">{datos.total_citas ?? 0}</span>
              <span className="est-card-label">
                {periodo === "dia" ? "Citas hoy" : periodo === "semana" ? "Citas esta semana" : "Citas este mes"}
              </span>
            </div>

            <div className="est-card est-card-servicios">
              <span className="est-card-numero">{datos.total_servicios ?? 0}</span>
              <span className="est-card-label">
                {periodo === "dia" ? "Servicios hoy" : periodo === "semana" ? "Servicios esta semana" : "Servicios este mes"}
              </span>
            </div>

            {datos.ingreso_estimado != null && (
              <div className="est-card est-card-ingresos">
                <span className="est-card-numero">
                  ${parseFloat(datos.ingreso_estimado).toFixed(2)}
                </span>
                <span className="est-card-label">Ingreso estimado</span>
              </div>
            )}
          </div>

          {/* SERVICIOS MÁS SOLICITADOS */}
          {datos.servicios_populares?.length > 0 && (
            <div className="est-seccion">
              <h2 className="est-seccion-titulo">Servicios más solicitados</h2>
              <div className="est-servicios-lista">
                {datos.servicios_populares.map((s, i) => (
                  <div key={i} className="est-servicio-fila">
                    <span className="est-servicio-rank">#{i + 1}</span>
                    <div className="est-servicio-barra-wrap">
                      <div className="est-servicio-nombre-row">
                        <span className="est-servicio-nombre">{s.nombre}</span>
                        <span className="est-servicio-count">{s.total} citas</span>
                      </div>
                      <div className="est-barra-bg">
                        <div
                          className="est-barra-fill"
                          style={{
                            width: `${Math.round((s.total / (datos.servicios_populares[0]?.total || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPLEADOS CON MÁS CITAS */}
          {datos.empleados_top?.length > 0 && (
            <div className="est-seccion">
              <h2 className="est-seccion-titulo">Empleados con más citas</h2>
              <div className="est-empleados-lista">
                {datos.empleados_top.map((e, i) => {
                  const colorAvatar = `hsl(${(i * 80 + 200) % 360}, 50%, 55%)`;
                  return (
                    <div key={i} className="est-empleado-fila">
                      <div
                        className="est-empleado-avatar"
                        style={{ background: colorAvatar }}
                      >
                        {e.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="est-empleado-info">
                        <span className="est-empleado-nombre">{e.nombre}</span>
                        <div className="est-barra-bg">
                          <div
                            className="est-barra-fill est-barra-empleado"
                            style={{
                              width: `${Math.round((e.total / (datos.empleados_top[0]?.total || 1)) * 100)}%`,
                              background: colorAvatar,
                            }}
                          />
                        </div>
                      </div>
                      <span className="est-empleado-count">{e.total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DISTRIBUCIÓN POR HORA (solo en día) */}
          {periodo === "dia" && datos.por_hora?.length > 0 && (
            <div className="est-seccion">
              <h2 className="est-seccion-titulo">Citas por hora</h2>
              <div className="est-horas">
                {datos.por_hora.map((h, i) => (
                  <div key={i} className="est-hora-col">
                    <div className="est-hora-barra-wrap">
                      <div
                        className="est-hora-barra"
                        style={{ height: `${Math.round((h.total / maxBarras) * 80)}px` }}
                        title={`${h.total} cita(s)`}
                      />
                    </div>
                    <span className="est-hora-label">{h.hora}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ESTADO VACÍO */}
          {datos.total_citas === 0 && (
            <div className="est-vacio">
              <span>📭</span>
              <p>No hay citas registradas para este período</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Estadisticas;
