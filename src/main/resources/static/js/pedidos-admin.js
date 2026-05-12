/* ─── pedidos-admin.js ──────────────────────────────────────────────────────── */

const API = '/api/pedidos';

let todosPedidos = [];

/* Mapa de estados → badge CSS + etiqueta legible */
const ESTADOS = {
  PENDIENTE     : { badge: 'badge-warn',    label: 'Pendiente'       },
  CONFIRMADO    : { badge: 'badge-ok',      label: 'Confirmado'      },
  EN_PREPARACION: { badge: 'badge-accent',  label: 'En preparación'  },
  DESPACHADO    : { badge: 'badge-ink',     label: 'Despachado'      },
  ENTREGADO     : { badge: 'badge-ok',      label: 'Entregado'       },
  CANCELADO     : { badge: 'badge-danger',  label: 'Cancelado'       },
  REEMBOLSADO   : { badge: 'badge-neutral', label: 'Reembolsado'     },
};

/* Transiciones válidas desde cada estado (lo que puede elegir el admin) */
const TRANSICIONES = {
  PENDIENTE     : ['CONFIRMADO',   'CANCELADO'],
  CONFIRMADO    : ['EN_PREPARACION','CANCELADO'],
  EN_PREPARACION: ['DESPACHADO'],
  DESPACHADO    : ['ENTREGADO'],
  ENTREGADO     : ['REEMBOLSADO'],
  CANCELADO     : [],
  REEMBOLSADO   : [],
};

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', cargarPedidos);

async function cargarPedidos() {
  try {
    const res    = await fetch(API);
    if (!res.ok) throw new Error();
    todosPedidos = await res.json();
    actualizarStats();
    renderTabla(todosPedidos);
  } catch {
    showToast('No se pudo cargar la lista de pedidos', 'error');
    document.getElementById('tablaBody').innerHTML =
      `<tr><td colspan="9" style="padding:2rem;text-align:center;color:var(--c-danger);">
        Error de conexión
      </td></tr>`;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════════════════ */
function actualizarStats() {
  const total      = todosPedidos.length;
  const pendientes = todosPedidos.filter(p => p.estado === 'PENDIENTE').length;
  const enProceso  = todosPedidos.filter(p => ['CONFIRMADO','EN_PREPARACION'].includes(p.estado)).length;
  const despachados= todosPedidos.filter(p => p.estado === 'DESPACHADO').length;
  const entregados = todosPedidos.filter(p => p.estado === 'ENTREGADO').length;
  const recaudado  = todosPedidos
    .filter(p => p.estado === 'ENTREGADO')
    .reduce((s, p) => s + (parseFloat(p.total) || 0), 0);

  document.getElementById('totalBadge').textContent = `${total} pedido${total !== 1 ? 's' : ''}`;
  document.getElementById('sTot').textContent        = total;
  document.getElementById('sPend').textContent       = pendientes;
  document.getElementById('sProc').textContent       = enProceso;
  document.getElementById('sDesp').textContent       = despachados;
  document.getElementById('sEntregados').textContent = entregados;
  document.getElementById('sTotal').textContent      = formatPrecio(recaudado);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLA
═══════════════════════════════════════════════════════════════════════════ */
function renderTabla(lista) {
  const tbody   = document.getElementById('tablaBody');
  const empty   = document.getElementById('emptyState');

  if (lista.length === 0) {
    tbody.innerHTML  = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = lista.map(p => {
    const { badge, label } = ESTADOS[p.estado] ?? { badge: 'badge-neutral', label: p.estado };
    const transiciones     = TRANSICIONES[p.estado] ?? [];

    const selectHtml = transiciones.length
      ? `<select class="estado-select" onchange="cambiarEstado(${p.idPedido}, this.value)"
                 title="Cambiar estado">
           <option value="">— Cambiar —</option>
           ${transiciones.map(e => `<option value="${e}">${ESTADOS[e]?.label ?? e}</option>`).join('')}
         </select>`
      : `<span style="font-size:12px;color:var(--c-ink-faint);">Sin acciones</span>`;

    return `
      <tr>
        <td class="td-mono">${p.numeroOrden ?? '—'}</td>
        <td style="font-size:13.5px;">${p.usuario?.nombre ?? `ID ${p.usuario?.idUsuario ?? '—'}`}</td>
        <td class="td-mono" style="white-space:nowrap">${formatFecha(p.creadoEn)}</td>
        <td class="td-price">${formatPrecio(p.subtotal)}</td>
        <td class="td-price" style="color:var(--c-ok)">${p.descuento > 0 ? '− ' + formatPrecio(p.descuento) : '—'}</td>
        <td class="td-price" style="font-weight:500">${formatPrecio(p.total)}</td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td>${selectHtml}</td>
        <td>
          <button class="btn btn-sm btn-edit" onclick="verDetalle(${p.idPedido})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Ver
          </button>
        </td>
      </tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAMBIAR ESTADO
═══════════════════════════════════════════════════════════════════════════ */
async function cambiarEstado(idPedido, nuevoEstado) {
  if (!nuevoEstado) return;

  try {
    const res = await fetch(`${API}/${idPedido}/estado`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) throw new Error();
    showToast(`Estado actualizado: ${ESTADOS[nuevoEstado]?.label}`, 'ok');
    cargarPedidos();
  } catch {
    showToast('No se pudo actualizar el estado', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTRO
═══════════════════════════════════════════════════════════════════════════ */
function filtrar() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const estado = document.getElementById('filtroEstado').value;

  const filtrados = todosPedidos.filter(p => {
    const matchQ = (p.numeroOrden ?? '').toLowerCase().includes(q)
                 || String(p.usuario?.idUsuario ?? '').includes(q)
                 || (p.usuario?.nombre ?? '').toLowerCase().includes(q);
    const matchE = estado ? p.estado === estado : true;
    return matchQ && matchE;
  });

  renderTabla(filtrados);
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRAWER DETALLE
═══════════════════════════════════════════════════════════════════════════ */
function verDetalle(idPedido) {
  const p = todosPedidos.find(x => x.idPedido === idPedido);
  if (!p) return;

  document.getElementById('drawerTitle').textContent = `Pedido ${p.numeroOrden ?? '#' + p.idPedido}`;
  document.getElementById('drawerSub').textContent   =
    `${formatFecha(p.creadoEn)} · ${ESTADOS[p.estado]?.label ?? p.estado}`;

  const { badge, label } = ESTADOS[p.estado] ?? { badge: 'badge-neutral', label: p.estado };

  document.getElementById('drawerBody').innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">Información del pedido</div>
      <div class="detail-row"><span class="label">N° Orden</span><span class="value mono">${p.numeroOrden ?? '—'}</span></div>
      <div class="detail-row"><span class="label">Estado</span><span class="value"><span class="badge ${badge}">${label}</span></span></div>
      <div class="detail-row"><span class="label">Fecha</span><span class="value">${formatFecha(p.creadoEn)}</span></div>
      <div class="detail-row"><span class="label">Moneda</span><span class="value">${p.moneda ?? 'COP'}</span></div>
      ${p.notas ? `<div class="detail-row"><span class="label">Notas</span><span class="value" style="max-width:240px;text-align:right">${p.notas}</span></div>` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Totales</div>
      <div class="detail-row"><span class="label">Subtotal</span><span class="value mono">${formatPrecio(p.subtotal)}</span></div>
      ${parseFloat(p.descuento) > 0 ? `<div class="detail-row" style="color:var(--c-ok)"><span class="label">Descuento</span><span class="value mono">− ${formatPrecio(p.descuento)}</span></div>` : ''}
      <div class="detail-row"><span class="label">Envío</span><span class="value mono">${formatPrecio(p.costoEnvio)}</span></div>
      <div class="detail-row"><span class="label">IVA</span><span class="value mono">${formatPrecio(p.iva)}</span></div>
      <div class="detail-row total"><span class="label">Total</span><span class="value mono">${formatPrecio(p.total)}</span></div>
    </div>

    ${p.direccion ? `
    <div class="detail-section">
      <div class="detail-section-title">Dirección de envío</div>
      <div class="detail-row"><span class="label">Destinatario</span><span class="value">${p.direccion.destinatario ?? '—'}</span></div>
      <div class="detail-row"><span class="label">Dirección</span><span class="value" style="max-width:240px;text-align:right">${p.direccion.linea1 ?? ''}${p.direccion.linea2 ? ', '+p.direccion.linea2 : ''}</span></div>
      <div class="detail-row"><span class="label">Ciudad</span><span class="value">${p.direccion.ciudad ?? ''}${p.direccion.departamento ? ', '+p.direccion.departamento : ''}</span></div>
    </div>` : ''}

    ${p.cupon ? `
    <div class="detail-section">
      <div class="detail-section-title">Cupón aplicado</div>
      <div class="detail-row"><span class="label">Código</span><span class="value mono">${p.cupon.codigo ?? '—'}</span></div>
      <div class="detail-row"><span class="label">Tipo</span><span class="value">${p.cupon.tipo ?? '—'}</span></div>
    </div>` : ''}
  `;

  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarDrawer(); });
