/* ─── utils.js ──────────────────────────────────────────────────────────────── */

/** Muestra un toast flotante
 * @param {string} msg
 * @param {'ok'|'warn'|'error'} type
 * @param {number} duration  ms
 */
function showToast(msg, type = 'ok', duration = 3200) {
  const container = document.getElementById('toast');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  container.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('show'));
  });

  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/** Formatea un número como moneda COP/USD */
function formatPrecio(valor) {
  if (valor == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style   : 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Genera estrellas ASCII a partir de un número (0-5) */
function starsFromRating(rating, total = 5) {
  const full  = Math.round(rating ?? 0);
  const empty = total - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

/** Iniciales de un nombre (máx 2 chars) */
function initials(nombre) {
  if (!nombre) return '?';
  return nombre.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');
}

/** Genera slug desde un string */
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Formatea fecha ISO a "dd MMM yyyy" en español */
function formatFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}
