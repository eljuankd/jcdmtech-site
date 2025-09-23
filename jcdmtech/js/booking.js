// /js/booking.js
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  // ---- Config ----
  const WHATSAPP_NUMBER = '17863487458'; // tu número sin + ni símbolos

  // ---- Prefijos / tracking ----
  const today = new Date(); today.setHours(0,0,0,0);
  const inputFecha = form.querySelector('input[name="fecha"]');
  if (inputFecha) inputFecha.min = today.toISOString().slice(0,10);

  const pageUrl = form.querySelector('input[name="page_url"]');
  if (pageUrl) pageUrl.value = location.href;
  const qs = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign'].forEach(k=>{
    const el = form.querySelector(`input[name="${k}"]`);
    if (el && qs.get(k)) el.value = qs.get(k);
  });

  function collect() {
    return Object.fromEntries(new FormData(form).entries());
  }

  function buildWhatsAppMessage(d) {
    return (
`*Reserva chofer privado*

Nombre: ${d.nombre || '-'}
Teléfono: ${d.telefono || '-'}
${d.fecha ? 'Fecha: ' + d.fecha : ''} ${d.hora ? 'Hora: ' + d.hora : ''} ${d.duracion_horas ? 'Horas: ' + d.duracion_horas : ''}
${d.origen ? 'Origen: ' + d.origen : ''} ${d.destino ? 'Destino: ' + d.destino : ''}
${d.comentarios ? 'Notas: ' + d.comentarios : ''}

Enviado desde jcdmtech.com`
    ).trim();
  }

  // Mini-modal para elegir canal
  function showChoice() {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'choice-backdrop';
      wrap.innerHTML = `
        <div class="choice-card">
          <h3 class="h3">¿Cómo quieres enviarlo?</h3>
          <p>Elige WhatsApp (respuesta más rápida) o Email.</p>
          <div class="choice-actions">
            <button class="btn btn-primary" id="optWa">WhatsApp</button>
            <button class="btn" id="optEmail">Email</button>
          </div>
          <button class="btn btn-ghost" id="optCancel" style="margin-top:.5rem;">Cancelar</button>
        </div>`;
      document.body.appendChild(wrap);

      const cleanup = () => wrap.remove();
      wrap.querySelector('#optWa').addEventListener('click', () => { cleanup(); resolve('whatsapp'); });
      wrap.querySelector('#optEmail').addEventListener('click', () => { cleanup(); resolve('email'); });
      wrap.querySelector('#optCancel').addEventListener('click', () => { cleanup(); resolve(null); });
      document.addEventListener('keydown', function onKey(e){
        if(e.key === 'Escape'){ document.removeEventListener('keydown', onKey); cleanup(); resolve(null); }
      });
    });
  }

  async function submitToFormspree() {
    const fd = new FormData(form);
    const fecha = fd.get('fecha'), hora = fd.get('hora');
    fd.set('_subject', `Reserva chofer • ${fecha || ''} ${hora || ''}`.trim());
    const res = await fetch(form.action, { method:'POST', headers:{ 'Accept':'application/json' }, body: fd });
    if (!res.ok) throw new Error('Formspree error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const data = collect();

    try {
      const choice = await showChoice();

      if (choice === 'whatsapp') {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
        window.open(url, '_blank', 'noopener');            // abre WA en pestaña nueva
        window.location.href = '/chofer-privado/gracias.html?via=wa'; // redirige esta página
        return;
      }

      if (choice === 'email') {
        await submitToFormspree();                         // envía por email (Formspree)
        window.location.href = '/chofer-privado/gracias.html?via=email';
        return;
      }

      // Cancelado
      msg.textContent = 'Envío cancelado.';
    } catch (err) {
      console.error(err);
      msg.textContent = 'Ups, no pudimos enviar tu reserva. Inténtalo de nuevo.';
      msg.style.color = '#ff7575';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Reservar ahora';
    }
  });
})();
function generateCode(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }

form.addEventListener('submit', async (e) => {
  // ...
  const data = collect();
  data.booking_code = generateCode();            // ← AQUI

  const choice = await showChoice();
  if (choice === 'whatsapp') {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
    window.open(url, '_blank', 'noopener');
    window.location.href = `/chofer-privado/gracias.html?via=wa&code=${data.booking_code}`;
    return;
  }
  if (choice === 'email') {
    await submitToFormspree(data);
    window.location.href = `/chofer-privado/gracias.html?via=email&code=${data.booking_code}`;
    return;
  }
});
function buildWhatsAppMessage(d) {
  return (
`*Reserva chofer privado*
${d.booking_code ? `*CÓDIGO:* ${d.booking_code}\n` : ''}
Nombre: ${d.nombre || '-'}
Teléfono: ${d.telefono || '-'}
${d.fecha ? 'Fecha: ' + d.fecha : ''} ${d.hora ? 'Hora: ' + d.hora : ''} ${d.duracion_horas ? 'Horas: ' + d.duracion_horas : ''}
${d.origen ? 'Origen: ' + d.origen : ''} ${d.destino ? 'Destino: ' + d.destino : ''}
${d.comentarios ? 'Notas: ' + d.comentarios : ''}

Enviado desde jcdmtech.com`
  ).trim();
}
async function submitToFormspree(data) {
  const fd = new FormData(form);
  const fecha = fd.get('fecha'), hora = fd.get('hora');
  const code = data?.booking_code ? ` [#${data.booking_code}]` : '';
  fd.set('_subject', `Reserva chofer${code} • ${fecha || ''} ${hora || ''}`.trim());
  const res = await fetch(form.action, { method:'POST', headers:{ 'Accept':'application/json' }, body: fd });
  if (!res.ok) throw new Error('Formspree error');
}
