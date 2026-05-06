/* ════════════════════════════════════════════════════════════
   usuarios.js  —  Lógica CRUD específica para Usuarios
   Depende de: utils.js  (debe cargarse ANTES que este archivo)
   ════════════════════════════════════════════════════════════ */

// ── URL base del endpoint de usuarios en Spring Boot ────────
// ⚠ Cambia esto si tu servidor corre en otro puerto o ruta
//const API = 'http://localhost:8080/api/usuarios';
const API = 'http://localhost:8080/api/usuarios';
// Estado local del formulario
let modoEdicion = false;

/* ════════════════════════════════════════════════════════════
   1. LISTAR  →  GET /api/usuarios
   Se llama al cargar la página y después de cada operación.
   ════════════════════════════════════════════════════════════ */
async function cargarUsuarios() {
  try {
    const usuarios = await apiGet(API);   // helper de utils.js
    renderTabla(usuarios);
  } catch (e) {
    mostrarToast('No se pudo conectar al servidor', 'error');
    document.getElementById('tablaBody').innerHTML =
      `<tr class="loading-row"><td colspan="6">Error al cargar datos</td></tr>`;
  }
}

/* ──────────────────────────────────────────────────────────
   Construye el HTML de las filas de la tabla
   ────────────────────────────────────────────────────────── */
function renderTabla(usuarios) {
  const body = document.getElementById('tablaBody');

  // Actualiza el badge y el estado vacío (funciones de utils.js)
  actualizarBadge(usuarios.length);
  toggleEmpty(usuarios.length === 0);

  if (usuarios.length === 0) {
    body.innerHTML = '';
    return;
  }

  body.innerHTML = usuarios.map(u => `
    <tr>
      <td style="color:var(--muted)">${u.idUsuario}</td>

      <td>
        <div class="name-cell">
          <div class="avatar">${iniciales(u.nombre, u.apellido)}</div>
          <div class="name-info">
            <span class="name-main">${esc(u.nombre)} ${esc(u.apellido ?? '')}</span>
            <span class="name-sub">${esc(u.email)}</span>
          </div>
        </div>
      </td>

      <td><span class="role-badge role-${u.rol}">${u.rol}</span></td>

      <td>
        <span class="status-dot ${u.activo ? 'status-on' : 'status-off'}">
          ${u.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      <td style="color:var(--muted)">${esc(u.telefono ?? '—')}</td>

      <td>
        <div class="td-actions">
          <button class="btn btn-edit"   onclick="editarUsuario(${u.idUsuario})">✎ Editar</button>
          <button class="btn btn-delete" onclick="pedirConfirmacion(${u.idUsuario})">✕ Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   2. CREAR / ACTUALIZAR  →  POST o PUT
   El mismo botón "Guardar" hace las dos cosas según modoEdicion
   ════════════════════════════════════════════════════════════ */
async function guardar() {
  // Leer los valores del formulario
  const id       = document.getElementById('idUsuario').value;
  const nombre   = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const rol      = document.getElementById('rol').value;
  const activo   = document.getElementById('activo').value === 'true';

  // Validación mínima en el cliente
  if (!nombre || !email) {
    mostrarToast('Nombre y email son obligatorios', 'warning');
    return;
  }
  if (!modoEdicion && !password) {
    mostrarToast('La contraseña es obligatoria al crear', 'warning');
    return;
  }

  // Objeto que se envía al backend como JSON
  const payload = { nombre, apellido, email, passwordHash: password, telefono, rol, activo };

  try {
    if (modoEdicion) {
      // PUT /api/usuarios/{id}
      await apiPut(`${API}/${id}`, payload);
      mostrarToast('Usuario actualizado ✓', 'success');
    } else {
      // POST /api/usuarios
      await apiPost(API, payload);
      mostrarToast('Usuario creado ✓', 'success');
    }

    limpiarFormulario();
    cargarUsuarios();   // Refresca la tabla

  } catch (e) {
    mostrarToast('Error al guardar: ' + e.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   3. EDITAR  →  GET /api/usuarios/{id}
   Carga los datos en el formulario y activa el modo edición
   ════════════════════════════════════════════════════════════ */
async function editarUsuario(id) {
  try {
    const u = await apiGet(`${API}/${id}`);

    // Rellenar cada campo
    document.getElementById('idUsuario').value = u.idUsuario;
    document.getElementById('nombre').value    = u.nombre    ?? '';
    document.getElementById('apellido').value  = u.apellido  ?? '';
    document.getElementById('email').value     = u.email     ?? '';
    document.getElementById('password').value  = '';   // Nunca exponemos el hash
    document.getElementById('telefono').value  = u.telefono  ?? '';
    document.getElementById('rol').value       = u.rol       ?? 'CLIENTE';
    document.getElementById('activo').value    = u.activo ? 'true' : 'false';

    // Cambiar la UI al modo edición (función de utils.js)
    modoEdicion = true;
    activarModoEdicion('Editar Usuario', 'Guardar cambios');

  } catch (e) {
    mostrarToast('No se pudo cargar el usuario', 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   4. ELIMINAR  →  DELETE /api/usuarios/{id}
   Primero abre el modal de confirmación.
   Cuando el usuario confirma, se ejecuta el callback.
   ════════════════════════════════════════════════════════════ */
function pedirConfirmacion(id) {
  // abrirModal(id, callback) — función de utils.js
  // El callback se ejecuta sólo si el usuario confirma
  abrirModal(id, eliminarUsuario);
}

async function eliminarUsuario(id) {
  try {
    await apiDelete(`${API}/${id}`);
    mostrarToast('Usuario eliminado', 'success');
    cargarUsuarios();
  } catch (e) {
    mostrarToast('Error al eliminar: ' + e.message, 'error');
  }
}

/* ════════════════════════════════════════════════════════════
   UTILIDADES DE FORMULARIO
   ════════════════════════════════════════════════════════════ */

// Limpia todos los campos y vuelve al modo "Crear"
function limpiarFormulario() {
  ['idUsuario','nombre','apellido','email','password','telefono'].forEach(campo => {
    document.getElementById(campo).value = '';
  });
  document.getElementById('rol').value    = 'CLIENTE';
  document.getElementById('activo').value = 'true';
  cancelarEdicion();
}

// Cancela la edición sin limpiar (el usuario puede querer descartar)
function cancelarEdicion() {
  modoEdicion = false;
  // desactivarModoEdicion(tituloForm, textoBtnGuardar) — función de utils.js
  desactivarModoEdicion('Nuevo Usuario', 'Crear Usuario');
}

/* ════════════════════════════════════════════════════════════
   ARRANQUE — se ejecuta cuando el DOM está listo
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', cargarUsuarios);
