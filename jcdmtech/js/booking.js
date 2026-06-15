// /js/booking.js — QUELVO / JCDM ride booking handler
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const msg           = document.getElementById('formMsg');
  const btn           = document.getElementById('submitBtn');
  const submitHelp    = document.getElementById('submitHelp');
  const channelInputs = form.querySelectorAll('input[name="contact_channel"]');
  const dateEl        = form.querySelector('input[name="fecha"]');
  const pageUrl       = form.querySelector('input[name="page_url"]');

  const WHATSAPP_NUMBER = '17863487458';

  const SUBMIT_LABELS = {
    whatsapp: 'Send via WhatsApp',
    email:    'Send via email'
  };
  const SUBMIT_HELP = {
    whatsapp: 'We\'ll open WhatsApp to confirm your ride.',
    email:    'We\'ll receive your request by email and reply with a confirmation shortly.'
  };
  const ERROR_MESSAGE = 'Could not process your request. Please try again or contact us via WhatsApp.';

  const generateCode    = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const collect         = () => Object.fromEntries(new FormData(form).entries());
  const selectedChannel = () => form.querySelector('input[name="contact_channel"]:checked')?.value || 'whatsapp';

  function setMessage(text = '', type = '') {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.remove('success', 'error');
    if (type) msg.classList.add(type);
  }

  function updateSubmitCopy() {
    const channel = selectedChannel();
    if (btn)        btn.textContent        = SUBMIT_LABELS[channel] || SUBMIT_LABELS.whatsapp;
    if (submitHelp) submitHelp.textContent = SUBMIT_HELP[channel]   || SUBMIT_HELP.whatsapp;
  }

  // Set today as minimum date
  if (dateEl && !dateEl.min) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const toISODate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateEl.min = toISODate(today);
  }

  if (pageUrl && !pageUrl.value) pageUrl.value = location.href;

  // Populate UTM params from query string
  const qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const el = form.querySelector(`input[name="${key}"]`);
    if (el && !el.value) el.value = qs.get(key) || '';
  });

  channelInputs.forEach((input) => input.addEventListener('change', updateSubmitCopy));
  updateSubmitCopy();

  function buildWhatsAppMessage(data) {
    return (
`*QUELVO — Ride Request*
${data.booking_code ? `*CODE:* ${data.booking_code}\n` : ''}Name: ${data.nombre || '-'}
Phone: ${data.telefono || '-'}
${data.fecha ? 'Date: ' + data.fecha : ''} ${data.hora ? 'Time: ' + data.hora : ''} ${data.duracion_horas ? 'Duration: ' + data.duracion_horas + 'h' : ''}
${data.origen ? 'Pickup: ' + data.origen : ''} ${data.destino ? 'Drop-off: ' + data.destino : ''}
${data.comentarios ? 'Notes: ' + data.comentarios : ''}

Submitted via jcdmtech.com`
    ).trim();
  }

  async function submitToFormspree(data) {
    const fd = new FormData(form);
    const code = data.booking_code ? ` [#${data.booking_code}]` : '';
    fd.set('_subject', `QUELVO Ride Request${code} — ${fd.get('fecha') || ''} ${fd.get('hora') || ''}`.trim());

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
      btn.textContent = 'Processing…';
    }

    const data = collect();
    data.booking_code = generateCode();

    try {
      if (selectedChannel() === 'whatsapp') {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
        window.open(url, '_blank', 'noopener');
        window.location.href = `/quelvo/book/gracias/?via=wa&code=${encodeURIComponent(data.booking_code)}`;
        return;
      }

      await submitToFormspree(data);
      window.location.href = `/quelvo/book/gracias/?via=email&code=${encodeURIComponent(data.booking_code)}`;
    } catch (err) {
      console.error(err);
      setMessage(ERROR_MESSAGE, 'error');
    } finally {
      if (btn) btn.disabled = false;
      updateSubmitCopy();
    }
  });
})();
