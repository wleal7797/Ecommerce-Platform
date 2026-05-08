/* ─── productos-admin.js ────────────────────────────────────────────────────── */

const API = '/api/productos';

let todosLosProductos = [];  // cache local
let idAEliminar       = null;

/* ═══════════════════════════════════════════════════════════════════════════
   INICIALIZACIÓN
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();

  /* Auto-slug desde nombre */
  document.getElementById('nombre').addEventListener('input', function () {
    const slugField = document.getElementById('slug');
    if (!slugField.dataset.manual) {
      slugField.value = toSlug(this.value);
    }
  });
  document.getElementById('slug').addEventListener('input', function () {
    this.dataset.manual = this.value ? 'true' : '';
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   CARGA Y RENDERIZADO
═══════════════════════════════════════════════════════════════════════════ */
async function cargarProductos() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Error al cargar productos');
    todosLosProductos = await res.json();
    actualizarStats();
    renderTabla(todosLosProductos);
  } catch (e) {
    showToast('No se pudo cargar el catálogo', 'error');
    document.getElementById('tablaBody').innerHTML =
      `<tr><td colspan="8" style="padding:2rem;text-align:center;color:var(--c-danger);">
        Error de conexión con el servidor
      </td></tr>`;
  }
}

function actualizarStats() {
  const total     = todosLosProductos.length;
  const activos   = todosLosProductos.filter(p => p.activo).length;
  const sinStock  = todosLosProductos.filter(p => p.stock === 0).length;
  const destacados= todosLosProductos.filter(p => p.destacado).length;

  document.getElementById('totalBadge').textContent   = `${total} producto${total !== 1 ? 's' : ''}`;
  document.getElementById('statTotal').textContent     = total;
  document.getElementById('statActivos').textContent   = activos;
  document.getElementById('statSinStock').textContent  = sinStock;
  document.getElementById('statDestacados').textContent= destacados;
}

function renderTabla(lista) {
  const tbody      = document.getElementById('tablaBody');
  const emptyState = document.getElementById('emptyState');

  if (lista.length === 0) {
    tbody.innerHTML  = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  tbody.innerHTML = lista.map((p, i) => {
    const stockClass = p.stock === 0 ? 'stock-zero'
                     : p.stock <= (p.stockMinimo ?? 5) ? 'stock-low'
                     : 'stock-ok';

    const estadoBadge = p.activo
      ? `<span class="badge badge-ok">● Activo</span>`
      : `<span class="badge badge-off">○ Inactivo</span>`;

    const flags = [
      p.destacado      ? `<span class="badge badge-accent">★ Dest.</span>` : '',
      p.permiteResenas ? `<span class="badge badge-ok">💬</span>` : '',
      p.precioOferta   ? `<span class="badge badge-warn">% Oferta</span>` : '',
    ].filter(Boolean).join(' ');

    const precioDisplay = p.precioOferta
      ? `<span style="text-decoration:line-through;color:var(--c-ink-faint);font-size:11px;">${formatPrecio(p.precio)}</span><br>${formatPrecio(p.precioOferta)}`
      : formatPrecio(p.precio);

    return `
      <tr>
        <td style="color:var(--c-ink-faint);font-family:var(--font-mono);font-size:12px;">${p.idProducto}</td>
        <td class="td-name" title="${p.nombre}">${truncar(p.nombre, 30)}</td>
        <td class="td-sku">${p.sku}</td>
        <td class="td-price">${precioDisplay}</td>
        <td class="td-stock ${stockClass}">${p.stock}</td>
        <td>${estadoBadge}</td>
        <td>${flags || '<span style="color:var(--c-ink-faint)">—</span>'}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-edit" onclick="editarProducto(${p.idProducto})" title="Editar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="abrirModal(${p.idProducto})" title="Eliminar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              Eliminar
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function truncar(str, max) {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTRO TABLA
═══════════════════════════════════════════════════════════════════════════ */
function filtrarTabla() {
  const query   = document.getElementById('searchInput').value.toLowerCase();
  const activo  = document.getElementById('filtroActivo').value;

  const filtrados = todosLosProductos.filter(p => {
    const matchTexto = (p.nombre ?? '').toLowerCase().includes(query)
                    || (p.sku   ?? '').toLowerCase().includes(query);
    const matchActivo = activo === ''     ? true
                      : activo === '1'   ? p.activo === true
                      : p.activo !== true;
    return matchTexto && matchActivo;
  });

  renderTabla(filtrados);
}

/* ═══════════════════════════════════════════════════════════════════════════
   CREAR / ACTUALIZAR
═══════════════════════════════════════════════════════════════════════════ */
async function guardar() {
  const id = document.getElementById('idProducto').value;

  const payload = {
    nombre         : v('nombre'),
    slug           : v('slug'),
    sku            : v('sku'),
    codigoBarras   : v('codigoBarras') || null,
    precio         : parseFloat(v('precio'))      || null,
    precioOferta   : parseFloat(v('precioOferta'))|| null,
    stock          : parseInt(v('stock'))          ?? 0,
    stockMinimo    : parseInt(v('stockMinimo'))    ?? 5,
    descripcion    : v('descripcion')    || null,
    descripcionCorta: v('descripcionCorta') || null,
    pesoKg         : parseFloat(v('pesoKg'))  || null,
    altoCm         : parseFloat(v('altoCm'))  || null,
    anchoCm        : parseFloat(v('anchoCm')) || null,
    largoCm        : parseFloat(v('largoCm')) || null,
    activo         : document.getElementById('activo').checked,
    destacado      : document.getElementById('destacado').checked,
    permiteResenas : document.getElementById('permiteResenas').checked,
    metaTitulo     : v('metaTitulo')     || null,
    metaDescripcion: v('metaDescripcion')|| null,
  };

  /* Validación mínima */
  if (!payload.nombre || !payload.sku || !payload.precio) {
    showToast('Nombre, SKU y Precio son obligatorios', 'warn');
    return;
  }

  try {
    const url    = id ? `${API}/${id}` : API;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Error del servidor');
    }

    showToast(id ? 'Producto actualizado ✓' : 'Producto creado ✓', 'ok');
    resetFormulario();
    cargarProductos();
  } catch (e) {
    showToast(e.message || 'Error al guardar', 'error');
  }
}

/* Helper: value de un input */
function v(id) { return document.getElementById(id)?.value?.trim() ?? ''; }

/* ═══════════════════════════════════════════════════════════════════════════
   EDITAR
═══════════════════════════════════════════════════════════════════════════ */
function editarProducto(id) {
  const p = todosLosProductos.find(x => x.idProducto === id);
  if (!p) return;

  document.getElementById('idProducto').value = p.idProducto;
  document.getElementById('nombre').value      = p.nombre         ?? '';
  document.getElementById('slug').value        = p.slug           ?? '';
  document.getElementById('sku').value         = p.sku            ?? '';
  document.getElementById('codigoBarras').value= p.codigoBarras   ?? '';
  document.getElementById('precio').value      = p.precio         ?? '';
  document.getElementById('precioOferta').value= p.precioOferta   ?? '';
  document.getElementById('stock').value       = p.stock          ?? 0;
  document.getElementById('stockMinimo').value = p.stockMinimo    ?? 5;
  document.getElementById('descripcion').value = p.descripcion    ?? '';
  document.getElementById('descripcionCorta').value = p.descripcionCorta ?? '';
  document.getElementById('pesoKg').value      = p.pesoKg         ?? '';
  document.getElementById('altoCm').value      = p.altoCm         ?? '';
  document.getElementById('anchoCm').value     = p.anchoCm        ?? '';
  document.getElementById('largoCm').value     = p.largoCm        ?? '';
  document.getElementById('metaTitulo').value  = p.metaTitulo     ?? '';
  document.getElementById('metaDescripcion').value = p.metaDescripcion ?? '';
  document.getElementById('activo').checked         = !!p.activo;
  document.getElementById('destacado').checked      = !!p.destacado;
  document.getElementById('permiteResenas').checked = !!p.permiteResenas;

  /* Marcar slug como manual para que no se sobreescriba */
  document.getElementById('slug').dataset.manual = 'true';

  document.getElementById('formTitle').textContent = 'Editar Producto';
  document.getElementById('formDot').style.background = 'var(--c-warn)';
  document.getElementById('btnText').textContent = 'Guardar cambios';
  document.getElementById('btnCancelar').style.display = 'inline-flex';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() { resetFormulario(); }

function resetFormulario() {
  ['idProducto','nombre','slug','sku','codigoBarras','precio','precioOferta',
   'stock','stockMinimo','descripcion','descripcionCorta','pesoKg','altoCm',
   'anchoCm','largoCm','metaTitulo','metaDescripcion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; delete el.dataset.manual; }
  });
  document.getElementById('activo').checked         = true;
  document.getElementById('destacado').checked      = false;
  document.getElementById('permiteResenas').checked = true;

  document.getElementById('formTitle').textContent       = 'Nuevo Producto';
  document.getElementById('formDot').style.background    = 'var(--c-accent)';
  document.getElementById('btnText').textContent         = 'Crear Producto';
  document.getElementById('btnCancelar').style.display   = 'none';
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL ELIMINAR
═══════════════════════════════════════════════════════════════════════════ */
function abrirModal(id) {
  idAEliminar = id;
  document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
  idAEliminar = null;
  document.getElementById('modalOverlay').classList.remove('open');
}

async function confirmarEliminar() {
  if (!idAEliminar) return;
  try {
    const res = await fetch(`${API}/${idAEliminar}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Producto eliminado', 'ok');
    cerrarModal();
    cargarProductos();
  } catch {
    showToast('No se pudo eliminar el producto', 'error');
  }
}

/* Cerrar modal al hacer clic fuera */
document.addEventListener('click', e => {
  const overlay = document.getElementById('modalOverlay');
  if (e.target === overlay) cerrarModal();
});
