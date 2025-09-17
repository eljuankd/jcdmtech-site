// /js/booking.js
(() => {
  const endpoint = "https://formspree.io/f/xgvljywo";

  const form = document.getElementById("bookingForm");
  const btn = document.getElementById("submitBtn");
  const msgOk = document.getElementById("msgOk");
  const msgErr = document.getElementById("msgErr");
  const waBtn = document.getElementById("waBtn");

  // 1) Fecha mínima = hoy
  const fecha = document.getElementById("fecha");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  fecha.min = `${yyyy}-${mm}-${dd}`;

  // 2) Build WhatsApp dynamic link
  function buildWaLink() {
    const nombre = document.getElementById("nombre").value || "";
    const telefono = document.getElementById("telefono").value || "";
    const f = fecha.value || "";
    const hora = document.getElementById("hora").value || "";
    const recogida = document.getElementById("recogida").value || "";
    const destino = document.getElementById("destino").value || "";
    const horas = document.getElementById("horas").value || "";
    const pasajeros = document.getElementById("pasajeros").value || "";
    const vehiculo = document.getElementById("tipo").value || "";

    const text = `Hola, quiero reservar un chofer privado:
- Nombre: ${nombre}
- Teléfono: ${telefono}
- Fecha/Hora: ${f} ${hora}
- Recogida: ${recogida}
- Destino: ${destino}
- Horas: ${horas}
- Pasajeros: ${pasajeros}
- Vehículo: ${vehiculo}`;

    const phone = "13050000000"; // <— tu número en formato internacional sin +
    waBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  form.addEventListener("input", buildWaLink);
  buildWaLink();

  // 3) Envío AJAX a Formspree
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgOk.hidden = true;
    msgErr.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando…";

    try {
      const data = new FormData(form);
      // (Opcional) agrega timestamp
      data.append("enviado_en", new Date().toISOString());

      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        form.reset();
        buildWaLink();
        msgOk.hidden = false;
        window.scrollTo({ top: msgOk.offsetTop - 40, behavior: "smooth" });
      } else {
        msgErr.hidden = false;
      }
    } catch {
      msgErr.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar solicitud";
    }
  });
})();
