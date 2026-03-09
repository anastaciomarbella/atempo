/* ============================================================
   service-worker.js
   Coloca este archivo en la raíz de /public de tu proyecto
   ============================================================ */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

/* ── RECIBIR NOTIFICACIÓN PUSH ── */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || "",
    icon: data.icon || "/logo192.png",   // cambia por tu ícono
    badge: data.badge || "/badge.png",
    tag: data.tag || "notificacion-general",
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/agenda-diaria",
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Nueva notificación", options)
  );
});

/* ── CLICK EN NOTIFICACIÓN ── */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlDestino = event.notification.data?.url || "/agenda-diaria";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlDestino);
          return client.focus();
        }
      }
      // Si no, abrir nueva pestaña
      if (clients.openWindow) {
        return clients.openWindow(urlDestino);
      }
    })
  );
});