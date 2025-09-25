// /js/booking.js
// JCDM — Reserva con opción WhatsApp o Email + booking_code y redirección a /gracias
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  // === Config ===
  const WHATSAPP_NUMBER = '17863487458'; // Número sin + ni símbolos

  // === Utilidades ===
  const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const collect = () => Object.fromEntries(new FormData(form).entries());

  // Min date seguro (idempotente y con huso horario)
  const dateEl = form.querySelector('input[name="fecha"]');
  if (dateEl && !dateEl.min) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const toISODate = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateEl.min = toISODate(today);
  }

  // Hidden tracking, solo si están vacíos (evita pisar valores previos)
  const qs = new URLSearchParams(location.search);
  const pageUrl = form.querySelector('input[name="page_url"]');
  if (pageUrl && !pageUrl.value) pageUrl.value = location.href;
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => {
    const el = form.querySelector(`input[name="${k}"]`);
    if (el && !el.value) el.value = qs.get(k) || '';
  });

  // Mensaje para WhatsApp (incluye booking_code si existe)
  function buildWhatsAppMessage(d) {
    return (
`*Reserva chofer privado*
${d.booking_code ? `*CÓDIGO:* ${d.booking_code}\n` : ''}Nombre: ${d.nombre || '-'}
Teléfono: ${d.telefono || '-'}
${d.fecha ? 'Fecha: ' + d.fecha : ''} ${d.hora ? 'Hora: ' + d.hora : ''} ${d.duracion_horas ? 'Horas: ' + d.duracion_horas : ''}
${d.origen ? 'Origen: ' + d.origen : ''} ${d.destino ? 'Destino: ' + d.destino : ''}
${d.comentarios ? 'Notas: ' + d.comentarios : ''}

Enviado desde jcdmtech.com`
    ).trim();
  }

  // Mini-modal para elegir canal (WA/Email)
  function showChoice() {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'choice-backdrop';
      wrap.innerHTML = `
        <div class="choice-card" role="dialog" aria-modal="true" aria-labelledby="choiceTitle">
          <h3 id="choiceTitle" class="h3">¿Cómo quieres enviarlo?</h3>
          <p class="muted">Elige WhatsApp (respuesta más rápida) o Email.</p>
          <div class="choice-actions">
            <button class="btn btn-primary" id="optWa" type="button">WhatsApp</button>
            <button class="btn" id="optEmail" type="button">Email</button>
          </div>
          <button class="btn-ghost" id="optCancel" type="button" style="margin-top:.5rem;">Cancelar</button>
        </div>`;
      document.body.appendChild(wrap);
      const cleanup = () => wrap.remove();

      wrap.querySelector('#optWa')?.addEventListener('click', () => { cleanup(); resolve('whatsapp'); });
      wrap.querySelector('#optEmail')?.addEventListener('click', () => { cleanup(); resolve('email'); });
      wrap.querySelector('#optCancel')?.addEventListener('click', () => { cleanup(); resolve(null); });

      const onKey = (e) => { if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); cleanup(); resolve(null); } };
      document.addEventListener('keydown', onKey);
    });
  }

  // Envío a Formspree con asunto enriquecido
  async function submitToFormspree(data) {
    const fd = new FormData(form);
    const fecha = fd.get('fecha'), hora = fd.get('hora');
    const code = data?.booking_code ? ` [#${data.booking_code}]` : '';
    fd.set('_subject', `Reserva chofer${code} • ${fecha || ''} ${hora || ''}`.trim());
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    });
    if (!res.ok) throw new Error('Formspree error');
  }

  // Submit principal
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación HTML5
    if (!form.checkValidity?.() && form.reportValidity) {
      form.reportValidity();
      return;
    }

    msg && (msg.textContent = '');
    if (msg) { msg.classList.remove('success', 'error'); }
    btn && (btn.disabled = true, btn.textContent = 'Enviando…');

    const data = collect();
    data.booking_code = generateCode();

    try {
      const choice = await showChoice();

      if (choice === 'whatsapp') {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
        window.open(url, '_blank', 'noopener'); // abrir WA
        window.location.href = `/chofer-privado/gracias.html?via=wa&code=${encodeURIComponent(data.booking_code)}`;
        return;
      }

      if (choice === 'email') {
        await submitToFormspree(data);
        window.location.href = `/chofer-privado/gracias.html?via=email&code=${encodeURIComponent(data.booking_code)}`;
        return;
      }

      // Cancelado
      if (msg) { msg.textContent = 'Envío cancelado.'; msg.classList.add('error'); }
    } catch (err) {
      console.error(err);
      if (msg) { msg.textContent = 'Ups, no pudimos enviar tu reserva. Inténtalo de nuevo.'; msg.classList.add('error'); }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Reservar ahora'; }
    }
  });
})();
