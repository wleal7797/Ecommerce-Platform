/* ─── checkout.js ───────────────────────────────────────────────────────────── */
/*
 * Dependencias en global.css/utils.js:
 *   showToast(msg, type)
 *   formatPrecio(valor)
 *
 * Estado global del checkout:
 *   carrito       → leído de sessionStorage (escrito por productos-cliente.js)
 *   idUsuario     → normalmente vendría de la sesión autenticada.
 *                   Aquí usamos 1 como demo; reemplaza con tu sistema de auth.
 *   cuponAplicado → objeto { cupon, descuento } o null
 *   idDireccionSeleccionada → ID de la dirección elegida
 */

const ID_USUARIO_DEMO = 1;   // ← reemplaza con el ID real del usuario autenticado
const COSTO_ENVIO     = 12000;
const TASA_IVA        = 0.19;

let carrito                  = [];
let cuponAplicado            = null;
let idDireccionSeleccionada  = null;
let mostrandoNuevaDireccion  = false;

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  cargarCarrito();
  cargarDirecciones();
  renderResumen();
});

/* ═══════════════════════════════════════════════════════════════════════════
   CARRITO (leído de sessionStorage)
═══════════════════════════════════════════════════════════════════════════ */
function cargarCarrito() {
  const raw = sessionStorage.getItem('carrito');
  carrito   = raw ? JSON.parse(raw) : [];

  /* Demo: si no hay carrito, ponemos items de ejemplo para que se vea */
  if (carrito.length === 0) {
    carrito = [
      { id: 1, nombre: 'Producto de ejemplo',   precio: 89000, qty: 2 },
      { id: 2, nombre: 'Otro producto ejemplo',  precio: 45000, qty: 1 },
    ];
  }

  renderItems();
}

function renderItems() {
  const container = document.getElementById('osItems');
  container.innerHTML = carrito.map(item => `
    <div class="os-item">
      <div>
        <div class="os-item-name">${item.nombre}</div>
        <div class="os-item-qty">× ${item.qty}</div>
      </div>
      <div class="os-item-price">${formatPrecio(item.precio * item.qty)}</div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESUMEN DE TOTALES
═══════════════════════════════════════════════════════════════════════════ */
function renderResumen() {
  const subtotal  = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const descuento = cuponAplicado ? parseFloat(cuponAplicado.descuento) : 0;
  const base      = Math.max(subtotal - descuento, 0);
  const iva       = base * TASA_IVA;
  const envio     = cuponAplicado?.cupon?.tipo === 'ENVIO_GRATIS' ? 0 : COSTO_ENVIO;
  const total     = base + iva + envio;

  document.getElementById('osSubtotal').textContent  = formatPrecio(subtotal);
  document.getElementById('osCostoEnvio').textContent= formatPrecio(envio);
  document.getElementById('osIva').textContent       = formatPrecio(iva);
  document.getElementById('osTotal').textContent     = formatPrecio(total);

  const descRow = document.getElementById('osDescuentoRow');
  if (descuento > 0) {
    descRow.style.display = 'flex';
    document.getElementById('osDescuento').textContent = '− ' + formatPrecio(descuento);
  } else {
    descRow.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIRECCIONES
═══════════════════════════════════════════════════════════════════════════ */
async function cargarDirecciones() {
  try {
    const res     = await fetch(`/api/direcciones/usuario/${ID_USUARIO_DEMO}`);
    const lista   = await res.json();
    renderDirecciones(lista);
  } catch {
    /* Si no hay endpoint aún, muestra solo el formulario de nueva dirección */
    renderDirecciones([]);
    toggleNuevaDireccion();
  }
}

function renderDirecciones(lista) {
  const container = document.getElementById('addrList');

  if (lista.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--c-ink-muted);margin-bottom:10px;">No tienes direcciones guardadas.</p>';
    return;
  }

  container.innerHTML = lista.map(d => `
    <label class="addr-chip ${d.predeterminada ? 'selected' : ''}"
           onclick="seleccionarDireccion(${d.idDireccion}, this)">
      <input type="radio" name="direccion" value="${d.idDireccion}"
             ${d.predeterminada ? 'checked' : ''}/>
      <div class="addr-chip-info">
        <span>${d.destinatario}</span>
        <small>${d.linea1}${d.linea2 ? ', ' + d.linea2 : ''}<br/>${d.ciudad}, ${d.departamento ?? ''} ${d.codigoPostal ?? ''}</small>
      </div>
      <span class="addr-tag">${d.etiqueta ?? 'Casa'}</span>
    </label>`).join('');

  /* Preseleccionar la predeterminada */
  const predet = lista.find(d => d.predeterminada);
  if (predet) idDireccionSeleccionada = predet.idDireccion;
}

function seleccionarDireccion(id, chipEl) {
  idDireccionSeleccionada = id;
  document.querySelectorAll('.addr-chip').forEach(c => c.classList.remove('selected'));
  chipEl.classList.add('selected');
  document.getElementById('subDireccion').textContent = 'Seleccionada ✓';
}

function toggleNuevaDireccion() {
  mostrandoNuevaDireccion = !mostrandoNuevaDireccion;
  document.getElementById('nuevaDireccionForm').style.display =
    mostrandoNuevaDireccion ? 'block' : 'none';
}

async function guardarDireccion() {
  const payload = {
    etiqueta    : document.getElementById('etiqueta').value,
    destinatario: document.getElementById('destinatario').value.trim(),
    linea1      : document.getElementById('linea1').value.trim(),
    linea2      : document.getElementById('linea2').value.trim() || null,
    ciudad      : document.getElementById('ciudad').value.trim(),
    departamento: document.getElementById('departamento').value.trim() || null,
    codigoPostal: document.getElementById('codigoPostal').value.trim() || null,
    pais        : document.getElementById('pais').value,
    predeterminada: false,
    /* El backend relaciona con el usuario por su ID — ajusta según tu auth */
    usuario     : { idUsuario: ID_USUARIO_DEMO },
  };

  if (!payload.destinatario || !payload.linea1 || !payload.ciudad) {
    showToast('Completa los campos obligatorios de la dirección', 'warn');
    return;
  }

  try {
    const res  = await fetch('/api/direcciones', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    const nueva = await res.json();
    showToast('Dirección guardada ✓', 'ok');
    idDireccionSeleccionada = nueva.idDireccion;
    cargarDirecciones();
    toggleNuevaDireccion();
  } catch {
    showToast('No se pudo guardar la dirección', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUPÓN
═══════════════════════════════════════════════════════════════════════════ */
async function aplicarCupon() {
  const codigo   = document.getElementById('codigoCupon').value.trim().toUpperCase();
  const result   = document.getElementById('cuponResult');
  const subtotal = carrito.reduce((s, i) => s + i.precio * i.qty, 0);

  if (!codigo) { showToast('Ingresa un código de cupón', 'warn'); return; }

  result.className = 'cupon-result';
  result.style.display = 'none';

  try {
    const res  = await fetch('/api/cupones/validar', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ codigo, subtotal }),
    });
    const data = await res.json();

    if (!res.ok) {
      result.className   = 'cupon-result error';
      result.innerHTML   = `<span>✕</span> ${data.error}`;
      cuponAplicado      = null;
    } else {
      cuponAplicado      = data;
      result.className   = 'cupon-result ok';
      result.innerHTML   = `<span>✓</span> ${data.mensaje} — Ahorra ${formatPrecio(data.descuento)}`;
      document.getElementById('subCupon').textContent = `${codigo} aplicado`;
    }
    renderResumen();
  } catch {
    result.className = 'cupon-result error';
    result.innerHTML = '<span>✕</span> Error al validar el cupón';
    cuponAplicado    = null;
    renderResumen();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACORDEÓN de secciones
═══════════════════════════════════════════════════════════════════════════ */
function toggleSection(sectionId) {
  const header = document.querySelector(`#${sectionId} .cs-header`);
  const body   = document.querySelector(`#${sectionId} .cs-body`);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

/* ═══════════════════════════════════════════════════════════════════════════
   REALIZAR PEDIDO
═══════════════════════════════════════════════════════════════════════════ */
async function realizarPedido() {
  if (carrito.length === 0) {
    showToast('El carrito está vacío', 'warn');
    return;
  }
  if (!idDireccionSeleccionada) {
    showToast('Selecciona o guarda una dirección de envío', 'warn');
    return;
  }

  const btn = document.getElementById('btnCheckout');
  btn.disabled     = true;
  btn.textContent  = 'Procesando…';

  const subtotal  = carrito.reduce((s, i) => s + i.precio * i.qty, 0);
  const descuento = cuponAplicado ? parseFloat(cuponAplicado.descuento) : 0;
  const base      = Math.max(subtotal - descuento, 0);
  const iva       = base * TASA_IVA;
  const envio     = cuponAplicado?.cupon?.tipo === 'ENVIO_GRATIS' ? 0 : COSTO_ENVIO;
  const total     = base + iva + envio;

  const payload = {
    usuario     : { idUsuario: ID_USUARIO_DEMO },
    direccion   : { idDireccion: idDireccionSeleccionada },
    cupon       : cuponAplicado ? { idCupon: cuponAplicado.cupon.idCupon } : null,
    subtotal,
    descuento,
    costoEnvio  : envio,
    iva,
    total,
    moneda      : 'COP',
    notas       : document.getElementById('notasPedido').value.trim() || null,
    estado      : 'PENDIENTE',
    /* Los detalles (DetallePedido) los construye el backend a partir del carrito.
       Si tu backend los espera aquí, añade:
       detalles: carrito.map(i => ({ idProducto: i.id, cantidad: i.qty, precioUnitario: i.precio }))
    */
  };

  try {
    const res  = await fetch('/api/pedidos', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    if (!res.ok) throw new Error();
    const pedido = await res.json();

    /* Limpiar carrito */
    sessionStorage.removeItem('carrito');

    /* Mostrar pantalla de confirmación */
    document.getElementById('formView').style.display    = 'none';
    document.getElementById('confirmView').style.display = 'block';
    document.getElementById('confirmNumero').textContent = pedido.numeroOrden;

    /* Avanzar step */
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step2').classList.add('done');
    document.querySelector('#step2 .step-num').textContent = '✓';
    document.getElementById('step3').classList.add('active');

  } catch {
    showToast('Hubo un error al procesar el pedido. Intenta de nuevo.', 'error');
    btn.disabled    = false;
    btn.textContent = 'Confirmar pedido';
  }
}
