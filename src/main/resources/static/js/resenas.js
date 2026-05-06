/* ════════════════════════════════════════════════════════════
   resenas.js  —  Lógica CRUD específica para Reseñas
   Depende de: utils.js  (debe cargarse ANTES que este archivo)
   ════════════════════════════════════════════════════════════ */

// ── URLs de los endpoints ────────────────────────────────────
const API         = 'http://localhost:8080/api/resenas';
const API_PROD    = 'http://localhost:8080/api/productos';   // para el <select>
const API_USR     = 'http://localhost:8080/api/usuarios';    // para el <select>

let modoEdicion = false;

/* ════════════════════════════════════════════════════════════
   ARRANQUE — carga todo al abrir la página
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    cargarSelects(),     // llena los <select> de producto y usuario
    cargarResenas()      // llena la tabla
  ]);
  iniciarToggles();      // activa los toggles de verificada / aprobada
});

/* ════════════════════════════════════════════════════════════
   CARGAR SELECTS — GET /api/productos  y  GET /api/usuarios
   Se llama una sola vez al inicio; los selects no cambian.
   ════════════════════════════════════════════════════════════ */
async function cargarSelects() {
  try {
    // Carga productos y usuarios en paralelo
    const [productos, usuarios] = await Promise.all([
      apiGet(API_PROD),
      apiGet(API_USR)
    ]);

    const selProd = document.getElementById('idProducto');
    const selUsr  = document.getElementById('idUsuario');

    // Llena el select de productos
    productos.forEach(p => {
      const opt = document.createElement('option');
      opt.value       = p.idProducto;
      opt.textContent = `#${p.idProducto} — ${p.nombre}`;
      selProd.appendChild(opt);
    });

    // Llena el select de usuarios
    usuarios.forEach(u => {
      const opt = document.createElement('option');
      opt.value       = u.idUsuario;
      opt.textContent = `#${u.idUsuario} — ${u.nombre} ${u.apellido ?? ''}`;
      selUsr.appendChild(opt);
    });

  } catch (e) {
    mostrarToast('No se pudieron cargar productos/usuarios', 'warning');
  }
}

/* ════════════════════════════════════════════════════════════
   1. LISTAR  →  GET /api/resenas
   ════════════════════════════════════════════════════════════ */
async function cargarResenas() {
  try {
    const resenas = await apiGet(API);
    renderTabla(resenas);
  } catch (e) {
    mostrarToast('Error al cargar reseñas', 'error');
    document.getElementById('tablaBody').innerHTML =
      `<tr class="loading-row"><td colspan="8">Error al cargar datos</td></tr>`;
  }
}

/* ──────────────────────────────────────────────────────────
   Construye el HTML de las filas
   ────────────────────────────────────────────────────────── */
function renderTabla(resenas) {
  const body = document.getElementById('tablaBody');
  actualizarBadge(resenas.length);
  toggleEmpty(resenas.length === 0);

  if (resenas.length === 0) { body.innerHTML = ''; return; }

  body.innerHTML = resenas.map(r => `
    <tr>
      <td style="color:var(--muted)">${r.idResena}</td>

      <td>
        <div class="ref-cell">
          <span class="ref-main">${esc(r.producto?.nombre ?? '—')}</span>
          <span class="ref-sub">ID ${r.producto?.idProducto ?? '?'}</span>
        </div>
      </td>

      <td>
        <div class="ref-cell">
          <span class="ref-main">${esc(r.usuario?.nombre ?? '—')} ${esc(r.usuario?.apellido ?? '')}</span>
          <span class="ref-sub">${esc(r.usuario?.email ?? '')}</span>
        </div>
      </td>

      <td>${renderEstrellas(r.calificacion)}</td>

      <td>
        <div class="ref-cell">
          <span class="ref-main">${esc(r.titulo ?? '—')}</span>
          <span class="resena-cuerpo">${esc(r.cuerpo ?? '')}</span>
        </div>
      </td>

      <td>
        <span class="badge-verificada ${r.verificada ? 'si' : 'no'}">
          ${r.verificada ? '✓ Verificada' : 'Sin verificar'}
        </span>
      </td>

      <td>
        <span class="badge-aprobada ${r.aprobada ? 'si' : 'no'}">
          ${r.aprobada ? '✓ Aprobada' : 'Pendiente'}
        </span>
      </td>

      <td>
        <div class="td-actions">
          <button class="btn btn-edit"   onclick="editarResena(${r.idResena})">✎ Editar</button>
          <button class="btn btn-delete" onclick="pedirConfirmacion(${r.idResena})">✕ Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* Genera el HTML de las estrellas ★ para la tabla */
function renderEstrellas(n) {
  const val = Math.min(5, Math.max(1, n || 1));
  let html = '<div class="stars-display">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= val ? 'star-filled' : 'star-empty'}">★</span>`;
  }
  html += '</div>';
  return html;
}

/* ════════════════════════════════════════════════════════════
   2. CREAR / ACTUALIZAR  →  POST o PUT
   ════════════════════════════════════════════════════════════ */
async function guardar() {
  const id          = document.getElementById('idResena').value;
  const idProducto  = document.getElementById('idProducto').value;
  const idUsuario   = document.getElementById('idUsuario').value;
  const calificacion = getCalificacion();   // lee el radio group de estrellas
  const titulo      = document.getElementById('titulo').value.trim();
  const cuerpo      = document.getElementById('cuerpo').value.trim();
  const verificada  = document.getElementById('toggleVerificada').classList.contains('on');
  const aprobada    = document.getElementById('toggleAprobada').classList.contains('on');

  // Validaciones
  if (!idProducto || !idUsuario) {
    mostrarToast('Selecciona producto y usuario', 'warning');
    return;
  }
  if (!calificacion) {
    mostrarToast('Selecciona una calificación (estrellas)', 'warning');
    return;
  }

  /*
    ⚠ IMPORTANTE — Relaciones ManyToOne:
    Spring Boot necesita el objeto anidado con el ID para
    que JPA entienda qué Producto y Usuario referenciar.
    NO se manda solo el número; se manda { idProducto: X }.
  */
  const payload = {
    producto:     { idProducto: parseInt(idProducto) },
    usuario:      { idUsuario:  parseInt(idUsuario)  },
    calificacion: parseInt(calificacion),
    titulo,
    cuerpo,
    verificada,
    aprobada
  };

  try {
    if (modoEdicion) {
      await apiPut(`${API}/${id}`, payload);
      mostrarToast('Reseña actualizada ✓', 'success');
    } else {
      await apiPost(API, payload);
      mostrarToast('Reseña creada ✓', 'success');
    }
    limpiarFormulario();
    cargarResenas();
  } catch (e) {
    mostrarToast('Error al guardar: ' + e.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   3. EDITAR  →  GET /api/resenas/{id}
   ════════════════════════════════════════════════════════════ */
async function editarResena(id) {
  try {
    const r = await apiGet(`${API}/${id}`);

    document.getElementById('idResena').value    = r.idResena;
    document.getElementById('idProducto').value  = r.producto?.idProducto ?? '';
    document.getElementById('idUsuario').value   = r.usuario?.idUsuario   ?? '';
    document.getElementById('titulo').value      = r.titulo  ?? '';
    document.getElementById('cuerpo').value      = r.cuerpo  ?? '';

    // Marca la estrella correspondiente
    setCalificacion(r.calificacion ?? 1);

    // Sincroniza los toggles
    setToggle('toggleVerificada', r.verificada);
    setToggle('toggleAprobada',   r.aprobada);

    modoEdicion = true;
    activarModoEdicion('Editar Reseña', 'Guardar cambios');

  } catch (e) {
    mostrarToast('No se pudo cargar la reseña', 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   4. ELIMINAR  →  DELETE /api/resenas/{id}
   ════════════════════════════════════════════════════════════ */
function pedirConfirmacion(id) {
  abrirModal(id, eliminarResena);
}

async function eliminarResena(id) {
  try {
    await apiDelete(`${API}/${id}`);
    mostrarToast('Reseña eliminada', 'success');
    cargarResenas();
  } catch (e) {
    mostrarToast('Error al eliminar: ' + e.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   UTILIDADES DEL FORMULARIO
   ════════════════════════════════════════════════════════════ */

function limpiarFormulario() {
  document.getElementById('idResena').value   = '';
  document.getElementById('idProducto').value = '';
  document.getElementById('idUsuario').value  = '';
  document.getElementById('titulo').value     = '';
  document.getElementById('cuerpo').value     = '';
  // Desmarca todas las estrellas
  document.querySelectorAll('.star-group input').forEach(r => r.checked = false);
  // Resetea toggles a sus valores por defecto
  setToggle('toggleVerificada', false);
  setToggle('toggleAprobada',   true);
  cancelarEdicion();
}

function cancelarEdicion() {
  modoEdicion = false;
  document.getElementById('idResena').value = '';
  desactivarModoEdicion('Nueva Reseña', 'Crear Reseña');
}

/* ──────────────────────────────────────────────────────────
   ESTRELLAS — leer y escribir el radio group
   ────────────────────────────────────────────────────────── */
function getCalificacion() {
  const checked = document.querySelector('.star-group input[type="radio"]:checked');
  return checked ? checked.value : null;
}

function setCalificacion(valor) {
  const radio = document.querySelector(`.star-group input[value="${valor}"]`);
  if (radio) radio.checked = true;
}

/* ──────────────────────────────────────────────────────────
   TOGGLE SWITCHES — inicialización y control
   ────────────────────────────────────────────────────────── */
function iniciarToggles() {
  // Asigna el click a cada toggle
  document.querySelectorAll('.toggle-group').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
    });
  });
}

function setToggle(elementId, estado) {
  const el = document.getElementById(elementId);
  if (!el) return;
  // Si estado=true → clase 'on'; si false → sin clase 'on'
  estado ? el.classList.add('on') : el.classList.remove('on');
}
