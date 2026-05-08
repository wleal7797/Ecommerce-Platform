/* ─── productos-cliente.js ──────────────────────────────────────────────────── */

const API_PRODUCTOS = '/api/productos/activos';
const API_RESENAS   = '/api/resenas';          /* ajusta si cambia el endpoint */

let todosProductos  = [];
let filtroActual    = 'todos';
let productoActual  = null;   /* producto abierto en el panel de reseñas */
let carrito         = [];

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  actualizarCarritoBadge();
});

/* ═══════════════════════════════════════════════════════════════════════════
   CARGA DE PRODUCTOS
═══════════════════════════════════════════════════════════════════════════ */
async function cargarProductos() {
  try {
    const res = await fetch(API_PRODUCTOS);
    if (!res.ok) throw new Error();
    todosProductos = await res.json();
    renderProductos(todosProductos);
  } catch {
    document.getElementById('productsGrid').innerHTML =
      `<div style="grid-column:1/-1;padding:3rem;text-align:center;color:var(--c-ink-muted);">
        No se pudo cargar el catálogo. Intenta más tarde.
      </div>`;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTROS
═══════════════════════════════════════════════════════════════════════════ */
function setFiltro(tipo) {
  filtroActual = tipo;
  ['Todos','Destacados','Ofertas'].forEach(t => {
    document.getElementById(`filtro${t}`).classList.remove('active');
  });
  document.getElementById(`filtro${tipo.charAt(0).toUpperCase()+tipo.slice(1)}`).classList.add('active');
  filtrarProductos();
}

function filtrarProductos() {
  const query = document.getElementById('filtroNombre').value.toLowerCase();

  let lista = todosProductos.filter(p => {
    const matchNombre = (p.nombre ?? '').toLowerCase().includes(query)
                     || (p.descripcionCorta ?? '').toLowerCase().includes(query);
    return matchNombre;
  });

  if (filtroActual === 'destacados') lista = lista.filter(p => p.destacado);
  if (filtroActual === 'ofertas')    lista = lista.filter(p => p.precioOferta);

  renderProductos(lista);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER DE TARJETAS
═══════════════════════════════════════════════════════════════════════════ */
function renderProductos(lista) {
  const grid       = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');

  if (lista.length === 0) {
    grid.innerHTML           = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  grid.innerHTML = lista.map(p => cardHTML(p)).join('');
}

function cardHTML(p) {
  const precio = p.precioOferta
    ? `<div>
        <div class="price-oferta">${formatPrecio(p.precioOferta)}</div>
        <div class="price-original">${formatPrecio(p.precio)}</div>
       </div>`
    : `<div class="price-main">${formatPrecio(p.precio)}</div>`;

  const rating = p.calificacionProm
    ? `<div class="product-rating">
        <span class="stars-display">${starsFromRating(p.calificacionProm)}</span>
        <span class="rating-count">(${p.totalResenas})</span>
       </div>` : '';

  const stockBtn = p.stock > 0
    ? `<button class="btn-add-cart" onclick="agregarCarrito(${p.idProducto}, event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
        Añadir
       </button>`
    : `<span class="out-of-stock">Sin stock</span>`;

  const resenasBtn = p.permiteResenas
    ? `<button class="btn-reviews" onclick="abrirResenas(${p.idProducto}, event)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        Reseñas
       </button>` : '';

  return `
    <article class="product-card" onclick="verDetalle(${p.idProducto})">
      <div class="product-img-wrap">
        <div class="product-img-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="2" y="2" width="20" height="20" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Sin imagen</span>
        </div>
        ${p.destacado    ? '<span class="badge-destac">Destacado</span>' : ''}
        ${p.precioOferta ? '<span class="badge-oferta">Oferta</span>'   : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.nombre}</div>
        <div class="product-desc">${p.descripcionCorta ?? ''}</div>
        ${rating}
        <div class="product-footer">
          <div class="price-wrap">${precio}</div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            ${resenasBtn}
            ${stockBtn}
          </div>
        </div>
      </div>
    </article>`;
}

function verDetalle(id) {
  /* Placeholder: aquí abrirías la página de detalle del producto */
  /* window.location.href = `/producto/${id}`; */
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARRITO (demo local)
═══════════════════════════════════════════════════════════════════════════ */
function agregarCarrito(id, event) {
  event.stopPropagation();
  const p = todosProductos.find(x => x.idProducto === id);
  if (!p) return;

  const existente = carrito.find(x => x.id === id);
  if (existente) existente.qty++;
  else carrito.push({ id, nombre: p.nombre, precio: p.precioOferta ?? p.precio, qty: 1 });

  actualizarCarritoBadge();
  showToast(`"${p.nombre}" añadido al carrito`, 'ok');
}

function actualizarCarritoBadge() {
  const total = carrito.reduce((s, x) => s + x.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL DE RESEÑAS
═══════════════════════════════════════════════════════════════════════════ */
function abrirResenas(idProducto, event) {
  event && event.stopPropagation();

  productoActual = todosProductos.find(p => p.idProducto === idProducto);
  if (!productoActual) return;

  /* Header del panel */
  document.getElementById('rpProductName').textContent =
    productoActual.nombre;
  document.getElementById('rpProductSub').textContent =
    `${productoActual.totalResenas ?? 0} opiniones · SKU: ${productoActual.sku}`;

  /* Abrir overlay y panel */
  document.getElementById('reviewsOverlay').classList.add('open');
  document.getElementById('reviewsPanel').classList.add('open');
  document.body.style.overflow = 'hidden';

  /* Resetear al tab "Leer" */
  switchRpTab('leer');

  /* Cargar reseñas */
  cargarResenas(idProducto);
}

function cerrarReseñas() {
  document.getElementById('reviewsOverlay').classList.remove('open');
  document.getElementById('reviewsPanel').classList.remove('open');
  document.body.style.overflow = '';
  productoActual = null;
}

/* Escape para cerrar panel */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarReseñas();
});

/* ── Tabs del panel ──────────────────────────────────────────────────────── */
function switchRpTab(tab) {
  document.getElementById('tabLeer').classList.toggle('active',     tab === 'leer');
  document.getElementById('tabEscribir').classList.toggle('active', tab === 'escribir');
  document.getElementById('rpLeer').style.display     = tab === 'leer'     ? 'block' : 'none';
  document.getElementById('rpEscribir').style.display = tab === 'escribir' ? 'block' : 'none';
}

/* ── Cargar reseñas del producto ─────────────────────────────────────────── */
async function cargarResenas(idProducto) {
  const listado = document.getElementById('rpListado');
  listado.innerHTML = '<p style="font-size:13px;color:var(--c-ink-muted);">Cargando reseñas…</p>';

  try {
    const res = await fetch(`${API_RESENAS}?productoId=${idProducto}`);
    if (!res.ok) throw new Error();
    const resenas = await res.json();
    renderResumenResenas(resenas);
    renderListadoResenas(resenas);
  } catch {
    /* Si la API de reseñas no existe aún, mostramos estado vacío */
    renderResumenResenas([]);
    listado.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem;color:var(--c-ink-muted);">
        <p style="font-size:14px;font-weight:500;margin-bottom:4px;">Sin reseñas aún</p>
        <small style="font-size:13px;">Sé el primero en opinar sobre este producto.</small>
      </div>`;
  }
}

function renderResumenResenas(lista) {
  const avg    = lista.length ? lista.reduce((s, r) => s + r.calificacion, 0) / lista.length : 0;
  const avgRnd = Math.round(avg * 10) / 10;

  document.getElementById('rpAvgNum').textContent   = lista.length ? avgRnd.toFixed(1) : '—';
  document.getElementById('rpAvgStars').textContent = starsFromRating(Math.round(avg));
  document.getElementById('rpTotalLabel').textContent = `${lista.length} reseña${lista.length !== 1 ? 's' : ''}`;

  /* Distribución */
  const dist = [5,4,3,2,1].map(n => ({
    n, count: lista.filter(r => r.calificacion === n).length,
  }));
  const max = Math.max(...dist.map(d => d.count), 1);

  document.getElementById('rpDistrib').innerHTML = dist.map(d => `
    <div class="distrib-row">
      <span class="distrib-lbl">${d.n}★</span>
      <div class="distrib-bar-wrap">
        <div class="distrib-bar" style="width:${Math.round(d.count/max*100)}%"></div>
      </div>
      <span class="distrib-n">${d.count}</span>
    </div>`).join('');
}

function renderListadoResenas(lista) {
  const listado = document.getElementById('rpListado');
  if (lista.length === 0) { listado.innerHTML = ''; return; }

  listado.innerHTML = lista.map(r => `
    <div class="review-item">
      <div class="review-top">
        <div class="reviewer">
          <div class="avatar">${initials(r.nombreUsuario ?? r.usuario?.nombre ?? 'U')}</div>
          <div>
            <div class="reviewer-name">${r.nombreUsuario ?? r.usuario?.nombre ?? 'Usuario'}</div>
            <div class="reviewer-date">${formatFecha(r.creadoEn ?? r.fecha)}</div>
          </div>
        </div>
        <div class="review-stars">${starsFromRating(r.calificacion)}</div>
      </div>
      ${r.titulo ? `<div class="review-title">${r.titulo}</div>` : ''}
      ${r.cuerpo ? `<div class="review-body">${r.cuerpo}</div>` : ''}
      ${r.verificada ? `<span class="verified-badge">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Compra verificada
      </span>` : ''}
    </div>`).join('');
}

/* ── Enviar reseña ───────────────────────────────────────────────────────── */
async function enviarResena() {
  if (!productoActual) return;

  const star   = document.querySelector('input[name="rpStar"]:checked');
  const nombre = document.getElementById('rpNombre').value.trim();
  const titulo = document.getElementById('rpTitulo').value.trim();
  const cuerpo = document.getElementById('rpCuerpo').value.trim();

  if (!star || !nombre || !titulo) {
    showToast('Completa todos los campos requeridos *', 'warn');
    return;
  }

  const payload = {
    idProducto   : productoActual.idProducto,
    calificacion : parseInt(star.value),
    nombreUsuario: nombre,
    titulo,
    cuerpo       : cuerpo || null,
    verificada   : false,
    aprobada     : true,
  };

  try {
    const res = await fetch(API_RESENAS, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();

    document.getElementById('rpFormWrap').style.display = 'none';
    document.getElementById('rpSuccess').style.display  = 'block';
    showToast('Reseña publicada correctamente ✓', 'ok');
  } catch {
    /* Si el endpoint aún no existe, igual mostramos el éxito en UI de demo */
    document.getElementById('rpFormWrap').style.display = 'none';
    document.getElementById('rpSuccess').style.display  = 'block';
    showToast('Reseña guardada (modo demo)', 'ok');
  }
}
