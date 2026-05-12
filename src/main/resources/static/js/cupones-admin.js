/* ─── cupones-admin.js ──────────────────────────────────────────────────────── */

const API = '/api/cupones';

let todosCupones = [];
let idAEliminar  = null;

const TIPO_LABEL = {
  PORCENTAJE  : 'Porcentaje',
  MONTO_FIJO  : 'Monto fijo',
  ENVIO_GRATIS: 'Envío gratis',
};

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  cargarCupones();
  actualizarLabelValor();

  /* Código en mayúsculas */
  document.getElementById('codigo').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   CARGA
═══════════════════════════════════════════════════════════════════════════ */
async function cargarCupones() {
  try {
    const res   = await fetch(API);
    todosCupones = await res.json();
    actualizarStats();
    renderTabla(todosCupones);
  } catch {
    showToast('No se pudo cargar los cupones', 'error');
  }
}

function actualizarStats() {
  const ahora    = new Date();
  const activos  = todosCupones.filter(c => c.activo).length;
  const expirados= todosCupones.filter(c =>
    c.vigenciaFin && new Date(c.vigenciaFin) < ahora
  ).length;
  const usosTot  = todosCupones.reduce((s, c) => s + (c.usosActuales ?? 0), 0);

  document.getElementById('totalBadge').textContent = `${todosCupones.length} cupones`;
  document.getElementById('sTot').textContent        = todosCupones.length;
  document.getElementById('sActivos').textContent    = activos;
  document.getElementById('sExp').textContent        = expirados;
  document.getElementById('sUsos').textContent       = usosTot;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLA
═══════════════════════════════════════════════════════════════════════════ */
function renderTabla(lista) {
  const tbody = document.getElementById('tablaBody');
  const empty = document.getElementById('emptyState');

  if (lista.length === 0) {
    tbody.innerHTML      = '';
    empty.style.display  = 'block';
    return;
  }
  empty.style.display = 'none';

  const ahora = new Date();

  tbody.innerHTML = lista.map(c => {
    const expirado  = c.vigenciaFin && new Date(c.vigenciaFin) < ahora;
    const vigente   = c.activo && !expirado;

    const estadoBadge = vigente
      ? `<span class="badge badge-ok">● Activo</span>`
      : expirado
        ? `<span class="badge badge-neutral">Expirado</span>`
        : `<span class="badge badge-danger">Inactivo</span>`;

    const valorDisplay = c.tipo === 'PORCENTAJE'   ? `${c.valor}%`
                       : c.tipo === 'ENVIO_GRATIS' ? 'Envío gratis'
                       : formatPrecio(c.valor);

    const usosDisplay  = c.usosMaximos
      ? `${c.usosActuales ?? 0} / ${c.usosMaximos}`
      : `${c.usosActuales ?? 0} / ∞`;

    const vigDisplay = c.vigenciaFin
      ? formatFecha(c.vigenciaFin)
      : '—';

    return `
      <tr>
        <td style="font-family:var(--font-mono);font-weight:600;letter-spacing:.05em;">${c.codigo}</td>
        <td><span class="badge badge-accent">${TIPO_LABEL[c.tipo] ?? c.tipo}</span></td>
        <td class="td-price">${valorDisplay}</td>
        <td class="td-price">${c.minimoCompra > 0 ? formatPrecio(c.minimoCompra) : '—'}</td>
        <td class="td-mono">${usosDisplay}</td>
        <td class="td-mono">${vigDisplay}</td>
        <td>${estadoBadge}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-sm btn-edit" onclick="editarCupon(${c.idCupon})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button class="btn btn-sm ${c.activo ? 'btn-danger' : 'btn-ok'}"
                    onclick="toggleActivo(${c.idCupon}, ${!c.activo})">
              ${c.activo ? 'Desactivar' : 'Activar'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="abrirModal(${c.idCupon})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              Eliminar
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════
   GUARDAR
═══════════════════════════════════════════════════════════════════════════ */
async function guardar() {
  const id = document.getElementById('idCupon').value;

  const payload = {
    codigo           : document.getElementById('codigo').value.trim().toUpperCase(),
    descripcion      : document.getElementById('descripcion').value.trim() || null,
    tipo             : document.getElementById('tipo').value,
    valor            : parseFloat(document.getElementById('valor').value)           || 0,
    minimoCompra     : parseFloat(document.getElementById('minimoCompra').value)     || 0,
    maximoDescuento  : parseFloat(document.getElementById('maximoDescuento').value)  || null,
    usosMaximos      : parseInt(document.getElementById('usosMaximos').value)        || null,
    usosPorUsuario   : parseInt(document.getElementById('usosPorUsuario').value)     || 1,
    activo           : document.getElementById('activo').checked,
    vigenciaInicio   : document.getElementById('vigenciaInicio').value || null,
    vigenciaFin      : document.getElementById('vigenciaFin').value    || null,
  };

  if (!payload.codigo) { showToast('El código es obligatorio', 'warn'); return; }
  if (payload.tipo !== 'ENVIO_GRATIS' && !payload.valor) {
    showToast('Ingresa un valor para el descuento', 'warn'); return;
  }

  try {
    const url    = id ? `${API}/${id}` : API;
    const method = id ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    showToast(id ? 'Cupón actualizado ✓' : 'Cupón creado ✓', 'ok');
    resetForm();
    cargarCupones();
  } catch {
    showToast('Error al guardar el cupón', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDITAR
═══════════════════════════════════════════════════════════════════════════ */
function editarCupon(id) {
  const c = todosCupones.find(x => x.idCupon === id);
  if (!c) return;

  document.getElementById('idCupon').value          = c.idCupon;
  document.getElementById('codigo').value           = c.codigo;
  document.getElementById('descripcion').value      = c.descripcion ?? '';
  document.getElementById('tipo').value             = c.tipo;
  document.getElementById('valor').value            = c.valor;
  document.getElementById('minimoCompra').value     = c.minimoCompra ?? '';
  document.getElementById('maximoDescuento').value  = c.maximoDescuento ?? '';
  document.getElementById('usosMaximos').value      = c.usosMaximos ?? '';
  document.getElementById('usosPorUsuario').value   = c.usosPorUsuario ?? 1;
  document.getElementById('activo').checked         = !!c.activo;
  document.getElementById('vigenciaInicio').value   = c.vigenciaInicio?.slice(0,16) ?? '';
  document.getElementById('vigenciaFin').value      = c.vigenciaFin?.slice(0,16)   ?? '';

  actualizarLabelValor();

  document.getElementById('formTitle').textContent       = 'Editar Cupón';
  document.getElementById('formDot').style.background    = 'var(--c-warn)';
  document.getElementById('btnText').textContent         = 'Guardar cambios';
  document.getElementById('btnCancelar').style.display   = 'inline-flex';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOGGLE ACTIVO
═══════════════════════════════════════════════════════════════════════════ */
async function toggleActivo(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/${id}/toggle`, {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ activo: nuevoEstado }),
    });
    if (!res.ok) throw new Error();
    showToast(nuevoEstado ? 'Cupón activado ✓' : 'Cupón desactivado', 'ok');
    cargarCupones();
  } catch {
    showToast('Error al cambiar el estado', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ELIMINAR
═══════════════════════════════════════════════════════════════════════════ */
function abrirModal(id)  { idAEliminar = id; document.getElementById('modalOverlay').classList.add('open'); }
function cerrarModal()   { idAEliminar = null; document.getElementById('modalOverlay').classList.remove('open'); }

async function confirmarEliminar() {
  if (!idAEliminar) return;
  try {
    const res = await fetch(`${API}/${idAEliminar}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Cupón eliminado', 'ok');
    cerrarModal();
    cargarCupones();
  } catch {
    showToast('No se pudo eliminar el cupón', 'error');
  }
}

document.addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) cerrarModal();
});

/* ═══════════════════════════════════════════════════════════════════════════
   FILTRO
═══════════════════════════════════════════════════════════════════════════ */
function filtrar() {
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const tipo = document.getElementById('filtroTipo').value;

  const filtrados = todosCupones.filter(c => {
    const matchQ  = (c.codigo ?? '').toLowerCase().includes(q)
                  || (c.descripcion ?? '').toLowerCase().includes(q);
    const matchT  = tipo ? c.tipo === tipo : true;
    return matchQ && matchT;
  });

  renderTabla(filtrados);
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function actualizarLabelValor() {
  const tipo  = document.getElementById('tipo').value;
  const label = document.getElementById('labelValor');
  const input = document.getElementById('valor');

  if (tipo === 'PORCENTAJE') {
    label.textContent    = 'Valor (%) *';
    input.placeholder    = 'Ej: 10';
    input.disabled       = false;
  } else if (tipo === 'MONTO_FIJO') {
    label.textContent    = 'Valor ($) *';
    input.placeholder    = 'Ej: 20000';
    input.disabled       = false;
  } else {
    label.textContent    = 'Valor (no aplica)';
    input.value          = '0';
    input.disabled       = true;
  }
}

function resetForm() {
  ['idCupon','codigo','descripcion','valor','minimoCompra','maximoDescuento',
   'usosMaximos','vigenciaInicio','vigenciaFin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('tipo').value          = 'PORCENTAJE';
  document.getElementById('usosPorUsuario').value= '1';
  document.getElementById('activo').checked      = true;
  actualizarLabelValor();

  document.getElementById('formTitle').textContent     = 'Nuevo Cupón';
  document.getElementById('formDot').style.background  = 'var(--c-accent)';
  document.getElementById('btnText').textContent       = 'Crear Cupón';
  document.getElementById('btnCancelar').style.display = 'none';
}
