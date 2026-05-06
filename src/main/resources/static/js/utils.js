/* ════════════════════════════════════════════════════════════
   utils.js  —  Funciones compartidas para TODO el proyecto
   Importar en cada HTML así (ANTES del JS específico de cada página):
     <script src="../js/utils.js"></script>
   ════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────
   TOAST — Notificación flotante temporal
   Uso: mostrarToast('Guardado con éxito', 'success')
        mostrarToast('Algo salió mal',      'error')
        mostrarToast('Campos incompletos',  'warning')
   ────────────────────────────────────────────────────────── */
let _toastTimer;

function mostrarToast(mensaje, tipo = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;                          // Protección: el div debe existir
  t.textContent = mensaje;
  t.className   = `toast ${tipo} show`;   // Activa la animación CSS
  clearTimeout(_toastTimer);
  // Oculta automáticamente a los 3.2 segundos
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}


/* ──────────────────────────────────────────────────────────
   MODAL DE CONFIRMACIÓN DE BORRADO
   Uso:
     abrirModal(id)       → abre el modal y guarda el ID
     cerrarModal()        → cierra el modal
     confirmarEliminar()  → ejecuta el callback registrado
   ────────────────────────────────────────────────────────── */
let _idParaEliminar  = null;
let _callbackEliminar = null;   // Función que ejecuta el DELETE real

/**
 * Abre el modal y registra qué ID borrar y qué función llamar.
 * @param {number|string} id         - ID del registro a eliminar
 * @param {Function}      callback   - función async que hace el DELETE
 */
function abrirModal(id, callback) {
  _idParaEliminar   = id;
  _callbackEliminar = callback;
  document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
  _idParaEliminar   = null;
  _callbackEliminar = null;
  document.getElementById('modalOverlay').classList.remove('open');
}

async function confirmarEliminar() {
  cerrarModal();
  if (typeof _callbackEliminar === 'function') {
    await _callbackEliminar(_idParaEliminar);
  }
}

// Cerrar modal al hacer click fuera de la caja
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarModal();
    });
  }
});


/* ──────────────────────────────────────────────────────────
   ESCAPE DE HTML — Previene XSS al insertar texto del servidor
   Uso: esc(usuario.nombre)
   ────────────────────────────────────────────────────────── */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}


/* ──────────────────────────────────────────────────────────
   INICIALES DE AVATAR
   Uso: iniciales('Juan', 'Pérez')  →  'JP'
   ────────────────────────────────────────────────────────── */
function iniciales(...palabras) {
  return palabras
    .map(p => p?.[0] ?? '')
    .join('')
    .toUpperCase() || '?';
}


/* ──────────────────────────────────────────────────────────
   ACTUALIZAR BADGE DE CONTEO
   Uso: actualizarBadge(usuarios.length)
   ────────────────────────────────────────────────────────── */
function actualizarBadge(total) {
  const badge = document.getElementById('totalBadge');
  if (badge) {
    badge.textContent = `${total} registro${total !== 1 ? 's' : ''}`;
  }
}


/* ──────────────────────────────────────────────────────────
   MOSTRAR / OCULTAR ESTADO VACÍO
   Uso: toggleEmpty(lista.length === 0)
   ────────────────────────────────────────────────────────── */
function toggleEmpty(estaVacio) {
  const empty = document.getElementById('emptyState');
  if (empty) empty.style.display = estaVacio ? 'block' : 'none';
}


/* ──────────────────────────────────────────────────────────
   MODO FORMULARIO — alterna entre "Crear" y "Editar"
   Cada página llama estas funciones pasando sus propios textos.

   Uso (en usuarios.js):
     activarModoEdicion('Editar Usuario', 'Guardar cambios')
     desactivarModoEdicion('Nuevo Usuario', 'Crear Usuario')
   ────────────────────────────────────────────────────────── */
function activarModoEdicion(tituloForm, textoBtnGuardar) {
  document.getElementById('formTitle').textContent  = tituloForm;
  document.getElementById('btnText').textContent    = textoBtnGuardar;
  document.getElementById('btnIcon').textContent    = '✎';
  document.getElementById('btnCancelar').style.display = 'block';
  document.getElementById('formDot').classList.add('dot-edit');
  // Scroll suave al formulario (útil en móvil)
  document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });
}

function desactivarModoEdicion(tituloForm, textoBtnGuardar) {
  const idInput = document.getElementById('idUsuario')  // intenta usuario
              ?? document.getElementById('idRegistro'); // fallback genérico
  if (idInput) idInput.value = '';

  document.getElementById('formTitle').textContent  = tituloForm;
  document.getElementById('btnText').textContent    = textoBtnGuardar;
  document.getElementById('btnIcon').textContent    = '＋';
  document.getElementById('btnCancelar').style.display = 'none';
  document.getElementById('formDot').classList.remove('dot-edit');
}


/* ──────────────────────────────────────────────────────────
   FETCH HELPERS — Wrappers sobre fetch() con manejo de errores
   Evitan repetir headers y try/catch en cada página.
   ────────────────────────────────────────────────────────── */

/**
 * GET  →  retorna el JSON o lanza un Error
 */
async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return res.json();
}

/**
 * POST  →  envía JSON, retorna el objeto creado
 */
async function apiPost(url, datos) {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(datos)
  });
  if (!res.ok) throw new Error(`POST ${url} → HTTP ${res.status}`);
  return res.json();
}

/**
 * PUT  →  envía JSON, retorna el objeto actualizado
 */
async function apiPut(url, datos) {
  const res = await fetch(url, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(datos)
  });
  if (!res.ok) throw new Error(`PUT ${url} → HTTP ${res.status}`);
  return res.json();
}

/**
 * DELETE  →  retorna true si fue exitoso (204 o 200)
 */
async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE ${url} → HTTP ${res.status}`);
  }
  return true;
}
