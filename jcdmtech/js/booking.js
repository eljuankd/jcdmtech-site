(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  // Prefija fecha mínima = hoy, evita pasados
  const today = new Date(); today.setHours(0,0,0,0);
  const inputFecha = form.querySelector('input[name="fecha"]');
  if (inputFecha) inputFecha.min = today.toISOString().slice(0,10);

  // Rellena metadatos
  form.querySelector('input[name="page_url"]').value = location.href;
  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign'].forEach(k=>{
    const el = form.querySelector(`input[name="${k}"]`);
    if (el && params.get(k)) el.value = params.get(k);
  });

  // Validación rápida de teléfono (muy laxa, solo evita basura)
  const isValidPhone = v => /^\+?[0-9 ().-]{7,}$/.test(v || '');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'form-msg';

    // Validación HTML5 + teléfono
    if (!form.reportValidity()) return;
    const tel = form.querySelector('[name="telefono"]').value;
    if (!isValidPhone(tel)) {
      msg.textContent = 'Por favor ingresa un teléfono válido (con código de país si aplica).';
      msg.style.color = '#ff7575';
      return;
    }

    // Antispam: si el honeypot tiene algo => aborta silenciosamente
    if (form.querySelector('input[name="_gotcha"]').value) {
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando…';

    try {
      const formData = new FormData(form);

      // Puedes agregar un subject legible en tu correo
      const fecha = formData.get('fecha'), hora = formData.get('hora');
      formData.set('_subject', `Reserva chofer • ${fecha || ''} ${hora || ''}`);
formData.set('_redirect', 'https://www.jcdmtech.com/gracias.html');

      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (res.ok) {
        form.reset();
        msg.textContent = '¡Reserva enviada! Te contactaremos a la brevedad por WhatsApp/Email.';
        msg.style.color = '#6CFF8D';

        // (Opcional) evento de conversión
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'booking_submitted' });
      } else {
        throw new Error('Formspree error');
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Ups, no pudimos enviar tu reserva. Inténtalo nuevamente o escríbenos por WhatsApp.';
      msg.style.color = '#ff7575';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Reservar ahora';
    }
  });
})();
