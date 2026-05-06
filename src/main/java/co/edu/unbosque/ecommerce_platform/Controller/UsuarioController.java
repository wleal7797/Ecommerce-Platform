package co.edu.unbosque.ecommerce_platform.Controller;

import co.edu.unbosque.ecommerce_platform.Model.Usuario;
import co.edu.unbosque.ecommerce_platform.Services.UsuarioDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    // Spring inyecta automáticamente el servicio (DAO) aquí
    @Autowired
    private UsuarioDAO usuarioDAO;

    // ─────────────────────────────────────────────
    // GET /api/usuarios
    // Retorna la lista completa de usuarios
    // ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Usuario>> getAll() {
        List<Usuario> usuarios = usuarioDAO.getAllUsuario();
        return ResponseEntity.ok(usuarios);
    }

    // ─────────────────────────────────────────────
    // GET /api/usuarios/{id}
    // Busca un usuario por su ID
    // 200 OK si existe, 404 si no
    // ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getById(@PathVariable int id) {
        Optional<Usuario> usuario = usuarioDAO.getUsuarioById(id);
        // Si el Optional tiene valor → 200 OK con el objeto
        // Si está vacío              → 404 Not Found
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────
    // POST /api/usuarios
    // Crea un nuevo usuario
    // El body JSON se convierte automáticamente a objeto Usuario
    // ─────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Usuario> create(@RequestBody Usuario usuario) {
        Usuario saved = usuarioDAO.saveOrUpdate(usuario);
        // 201 Created con el objeto guardado (incluye el id generado)
        return ResponseEntity.status(201).body(saved);
    }

    // ─────────────────────────────────────────────
    // PUT /api/usuarios/{id}
    // Actualiza un usuario existente
    // Se busca primero para confirmar que existe
    // ─────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> update(@PathVariable int id,
                                          @RequestBody Usuario usuario) {
        Optional<Usuario> existente = usuarioDAO.getUsuarioById(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Forzamos el mismo ID para que JPA haga UPDATE y no INSERT
        usuario.setIdUsuario(id);
        Usuario actualizado = usuarioDAO.saveOrUpdate(usuario);
        return ResponseEntity.ok(actualizado);
    }

    // ─────────────────────────────────────────────
    // DELETE /api/usuarios/{id}
    // Elimina un usuario por ID
    // 204 No Content si se borró, 404 si no existía
    // ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        Optional<Usuario> existente = usuarioDAO.getUsuarioById(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        usuarioDAO.deleteUsuario(id);
        // 204 No Content: operación exitosa, sin cuerpo de respuesta
        return ResponseEntity.noContent().build();
    }
}