package co.edu.unbosque.ecommerce_platform.Controller;
import co.edu.unbosque.ecommerce_platform.Model.*;
import co.edu.unbosque.ecommerce_platform.Services.ResenaDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*")
public class ResenaController {

    @Autowired
    private ResenaDAO resenaDAO;

    // ─────────────────────────────────────────────
    // GET /api/resenas
    // Retorna todas las reseñas
    // ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Resena>> getAll() {
        return ResponseEntity.ok(resenaDAO.getAllResena());
    }

    // ─────────────────────────────────────────────
    // GET /api/resenas/{id}
    // Retorna una reseña por ID
    // ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Resena> getById(@PathVariable int id) {
        Optional<Resena> resena = resenaDAO.getResenaById(id);
        return resena.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────
    // POST /api/resenas
    // Crea una nueva reseña
    //
    // El body JSON debe incluir los IDs de producto y usuario
    // en formato de objeto anidado, porque Resena tiene
    // relaciones @ManyToOne con Producto y Usuario:
    //
    // {
    //   "producto":      { "idProducto": 1 },
    //   "usuario":       { "idUsuario":  2 },
    //   "calificacion":  5,
    //   "titulo":        "Excelente",
    //   "cuerpo":        "Muy buen producto",
    //   "verificada":    false,
    //   "aprobada":      true
    // }
    // ─────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Resena> create(@RequestBody Resena resena) {
        Resena saved = resenaDAO.saveOrUpdate(resena);
        return ResponseEntity.status(201).body(saved);
    }

    // ─────────────────────────────────────────────
    // PUT /api/resenas/{id}
    // Actualiza una reseña existente
    // ─────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Resena> update(@PathVariable int id,
                                         @RequestBody Resena resena) {
        Optional<Resena> existente = resenaDAO.getResenaById(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        resena.setIdResena(id);
        Resena actualizada = resenaDAO.saveOrUpdate(resena);
        return ResponseEntity.ok(actualizada);
    }

    // ─────────────────────────────────────────────
    // DELETE /api/resenas/{id}
    // Elimina una reseña
    // ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        Optional<Resena> existente = resenaDAO.getResenaById(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        resenaDAO.deleteResena(id);
        return ResponseEntity.noContent().build();
    }
}
