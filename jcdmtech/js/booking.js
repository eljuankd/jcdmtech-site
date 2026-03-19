// /js/booking.js
// JCDM - Reserva con canal seleccionado desde el formulario
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');
  const submitHelp = document.getElementById('submitHelp');
  const channelInputs = form.querySelectorAll('input[name="contact_channel"]');
  const dateEl = form.querySelector('input[name="fecha"]');
  const pageUrl = form.querySelector('input[name="page_url"]');

  const WHATSAPP_NUMBER = '17863487458';
  const SUBMIT_LABELS = {
    whatsapp: 'Enviar por WhatsApp',
    email: 'Enviar por email'
  };
  const SUBMIT_HELP = {
    whatsapp: 'Te abriremos WhatsApp para confirmar tu servicio con atencion inmediata.',
    email: 'Recibiremos tu solicitud por email y te responderemos con confirmacion a la brevedad.'
  };
  const ERROR_MESSAGE = 'No pudimos procesar tu solicitud en este momento. Intentalo nuevamente en unos minutos.';

  const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const collect = () => Object.fromEntries(new FormData(form).entries());
  const selectedChannel = () => form.querySelector('input[name="contact_channel"]:checked')?.value || 'whatsapp';

  function setMessage(text = '', type = '') {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove('success', 'error');
    if (type) msg.classList.add(type);
  }

  function updateSubmitCopy() {
    const channel = selectedChannel();
    if (btn) btn.textContent = SUBMIT_LABELS[channel] || SUBMIT_LABELS.whatsapp;
    if (submitHelp) submitHelp.textContent = SUBMIT_HELP[channel] || SUBMIT_HELP.whatsapp;
  }

  if (dateEl && !dateEl.min) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toISODate = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateEl.min = toISODate(today);
  }

  if (pageUrl && !pageUrl.value) pageUrl.value = location.href;

  const qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const el = form.querySelector(`input[name="${key}"]`);
    if (el && !el.value) el.value = qs.get(key) || '';
  });

  channelInputs.forEach((input) => {
    input.addEventListener('change', updateSubmitCopy);
  });
  updateSubmitCopy();

  function buildWhatsAppMessage(data) {
    return (
`*Reserva chofer privado*
${data.booking_code ? `*CODIGO:* ${data.booking_code}\n` : ''}Nombre: ${data.nombre || '-'}
Telefono: ${data.telefono || '-'}
${data.fecha ? 'Fecha: ' + data.fecha : ''} ${data.hora ? 'Hora: ' + data.hora : ''} ${data.duracion_horas ? 'Horas: ' + data.duracion_horas : ''}
${data.origen ? 'Origen: ' + data.origen : ''} ${data.destino ? 'Destino: ' + data.destino : ''}
${data.comentarios ? 'Detalles: ' + data.comentarios : ''}

Solicitud enviada desde jcdmtech.com`
    ).trim();
  }

  async function submitToFormspree(data) {
    const fd = new FormData(form);
    const fecha = fd.get('fecha');
    const hora = fd.get('hora');
    const code = data.booking_code ? ` [#${data.booking_code}]` : '';
    fd.set('_subject', `Reserva chofer${code} - ${fecha || ''} ${hora || ''}`.trim());

    const res = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: fd
    });

    if (!res.ok) throw new Error('Formspree error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity?.() && form.reportValidity) {
      form.reportValidity();
      return;
    }

    setMessage('');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Procesando solicitud...';
    }

    const data = collect();
    data.booking_code = generateCode();

    try {
      if (selectedChannel() === 'whatsapp') {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
        window.open(url, '_blank', 'noopener');
        window.location.href = `/chofer-privado/gracias.html?via=wa&code=${encodeURIComponent(data.booking_code)}`;
        return;
      }

      await submitToFormspree(data);
      window.location.href = `/chofer-privado/gracias.html?via=email&code=${encodeURIComponent(data.booking_code)}`;
    } catch (err) {
      console.error(err);
      setMessage(ERROR_MESSAGE, 'error');
    } finally {
      if (btn) btn.disabled = false;
      updateSubmitCopy();
    }
  });
})();
