package co.edu.unbosque.ecommerce_platform.Controller;

import co.edu.unbosque.ecommerce_platform.Model.DireccionEnvio;
import co.edu.unbosque.ecommerce_platform.Services.DireccionEnvioDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * DireccionController
 *
 *   GET    /api/direcciones/usuario/{idUsuario}  → direcciones del usuario
 *   POST   /api/direcciones                      → crear
 *   PUT    /api/direcciones/{id}                 → actualizar
 *   DELETE /api/direcciones/{id}                 → eliminar
 *   PATCH  /api/direcciones/{id}/predeterminada  → marcar como predeterminada
 */
@RestController
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "*")
public class DireccionEnvioController {

    @Autowired
    private DireccionEnvioDAO direccionDAO;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<DireccionEnvio>> getByUsuario(@PathVariable int idUsuario) {
        List<DireccionEnvio> lista = direccionDAO.getAllDireccionEnvio().stream()
                .filter(d -> d.getUsuario() != null
                        && d.getUsuario().getIdUsuario() == idUsuario)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<DireccionEnvio> crear(@RequestBody DireccionEnvio dir) {
        return ResponseEntity.status(HttpStatus.CREATED).body(direccionDAO.saveOrUpdate(dir));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DireccionEnvio> actualizar(@PathVariable int id,
                                                     @RequestBody DireccionEnvio datos) {
        Optional<DireccionEnvio> existente = direccionDAO.getDireccionEnvioById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        DireccionEnvio d = existente.get();
        d.setEtiqueta(datos.getEtiqueta());
        d.setDestinatario(datos.getDestinatario());
        d.setLinea1(datos.getLinea1());
        d.setLinea2(datos.getLinea2());
        d.setCiudad(datos.getCiudad());
        d.setDepartamento(datos.getDepartamento());
        d.setCodigoPostal(datos.getCodigoPostal());
        d.setPais(datos.getPais());
        d.setPredeterminada(datos.getPredeterminada());
        return ResponseEntity.ok(direccionDAO.saveOrUpdate(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        if (direccionDAO.getDireccionEnvioById(id).isEmpty()) return ResponseEntity.notFound().build();
        direccionDAO.deleteDireccionEnvio(id);
        return ResponseEntity.noContent().build();
    }

    /** Marca esta dirección como predeterminada y desactiva las demás del mismo usuario */
    @PatchMapping("/{id}/predeterminada")
    public ResponseEntity<DireccionEnvio> setPredeterminada(@PathVariable int id) {
        Optional<DireccionEnvio> existente = direccionDAO.getDireccionEnvioById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        DireccionEnvio target = existente.get();

        // Desmarcar todas las del mismo usuario
        if (target.getUsuario() != null) {
            int idUsuario = target.getUsuario().getIdUsuario();
            direccionDAO.getAllDireccionEnvio().stream()
                    .filter(d -> d.getUsuario() != null
                            && d.getUsuario().getIdUsuario() == idUsuario
                            && !d.getIdDireccion().equals(id))
                    .forEach(d -> {
                        d.setPredeterminada(false);
                        direccionDAO.saveOrUpdate(d);
                    });
        }

        target.setPredeterminada(true);
        return ResponseEntity.ok(direccionDAO.saveOrUpdate(target));
    }
}