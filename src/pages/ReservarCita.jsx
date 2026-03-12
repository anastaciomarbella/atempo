import React, { useEffect, useState } from "react";
import "../styles/reservarCita.css";

export default function ReservarCita() {

  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {

      const res = await fetch("http://localhost:3001/api/servicios");
      const data = await res.json();

      setServicios(data);

    } catch (error) {

      console.error("Error cargando servicios", error);

    } finally {

      setLoadingServicios(false);

    }
  };

  const handleSeleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
  };

  const safeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:3001/${url}`;
  };

  /* ---------- CORRECCIÓN DURACIÓN ---------- */

  const formatearDuracion = (duracion) => {

    if (!duracion) return "";

    if (typeof duracion === "number") {

      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;

      let texto = "";

      if (horas > 0) texto += `${horas}h `;
      if (minutos > 0) texto += `${minutos}m`;

      return texto.trim();
    }

    if (typeof duracion === "string") {

      if (!duracion.includes(":")) return duracion;

      const [h, m] = duracion.split(":");

      const horas = parseInt(h);
      const minutos = parseInt(m);

      let texto = "";

      if (horas > 0) texto += `${horas}h `;
      if (minutos > 0) texto += `${minutos}m`;

      return texto.trim();
    }

    return "";
  };

  return (

    <div className="rc-container">

      <h2 className="rc-title">Selecciona un servicio</h2>

      {loadingServicios && <p>Cargando servicios...</p>}

      {!loadingServicios && servicios.length === 0 && (
        <p>No hay servicios disponibles</p>
      )}

      {!loadingServicios && servicios.length > 0 && (

        <div className="rc-servicios-scroll">

          <div className="rc-servicios-grid">

            {servicios.map((s, index) => {

              const seleccionado =
                servicioSeleccionado?.id_servicio === s.id_servicio;

              return (

                <button
                  key={s.id_servicio}
                  type="button"
                  className={`rc-servicio-card ${seleccionado ? "rc-servicio-seleccionado" : ""}`}
                  onClick={() => handleSeleccionarServicio(s)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >

                  <div className="rc-servicio-img-wrap">

                    {s.imagen_url ? (
                      <img
                        src={safeUrl(s.imagen_url)}
                        alt={s.nombre}
                        className="rc-servicio-img"
                      />
                    ) : (
                      <div className="rc-servicio-img-placeholder">
                        ✂️
                      </div>
                    )}

                    {seleccionado && (
                      <div className="rc-servicio-check">✓</div>
                    )}

                  </div>

                  <div className="rc-servicio-info">

                    <span className="rc-servicio-nombre">
                      {s.nombre}
                    </span>

                    <div className="rc-servicio-meta">

                      {s.precio && (
                        <span className="rc-servicio-precio">
                          ${parseFloat(s.precio).toFixed(2)}
                        </span>
                      )}

                      {s.duracion && (
                        <span className="rc-servicio-duracion">
                          ⏱ {formatearDuracion(s.duracion)}
                        </span>
                      )}

                    </div>

                    {s.descripcion && (
                      <span className="rc-servicio-desc">
                        {s.descripcion}
                      </span>
                    )}

                  </div>

                </button>

              );

            })}

          </div>

        </div>

      )}

    </div>

  );
}