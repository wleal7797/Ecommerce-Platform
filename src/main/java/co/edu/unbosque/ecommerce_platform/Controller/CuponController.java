package co.edu.unbosque.ecommerce_platform.Controller;

import co.edu.unbosque.ecommerce_platform.Model.Cupon;
import co.edu.unbosque.ecommerce_platform.Services.CuponDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * CuponController
 *
 * Rutas admin:
 *   GET    /api/cupones              → listar todos
 *   GET    /api/cupones/{id}         → detalle
 *   POST   /api/cupones              → crear
 *   PUT    /api/cupones/{id}         → actualizar
 *   DELETE /api/cupones/{id}         → eliminar
 *   PATCH  /api/cupones/{id}/toggle  → activar / desactivar
 *
 * Ruta pública (cliente en checkout):
 *   POST /api/cupones/validar        → valida un código y devuelve el cupón si es válido
 */
@RestController
@RequestMapping("/api/cupones")
@CrossOrigin(origins = "*")
public class CuponController {

    @Autowired
    private CuponDAO cuponDAO;

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Cupon>> getAll() {
        return ResponseEntity.ok(cuponDAO.getAllCupon());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cupon> getById(@PathVariable int id) {
        return cuponDAO.getCuponById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cupon> crear(@RequestBody Cupon cupon) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(cuponDAO.saveOrUpdate(cupon));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cupon> actualizar(@PathVariable int id, @RequestBody Cupon datos) {
        Optional<Cupon> existente = cuponDAO.getCuponById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Cupon c = existente.get();
        c.setCodigo(datos.getCodigo());
        c.setDescripcion(datos.getDescripcion());
        c.setTipo(datos.getTipo());
        c.setValor(datos.getValor());
        c.setMinimoCompra(datos.getMinimoCompra());
        c.setMaximoDescuento(datos.getMaximoDescuento());
        c.setUsosMaximos(datos.getUsosMaximos());
        c.setUsosPorUsuario(datos.getUsosPorUsuario());
        c.setActivo(datos.getActivo());
        c.setVigenciaInicio(datos.getVigenciaInicio());
        c.setVigenciaFin(datos.getVigenciaFin());

        return ResponseEntity.ok(cuponDAO.saveOrUpdate(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        if (cuponDAO.getCuponById(id).isEmpty()) return ResponseEntity.notFound().build();
        cuponDAO.deleteCupon(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Cupon> toggle(@PathVariable int id, @RequestBody Map<String, Boolean> body) {
        Optional<Cupon> existente = cuponDAO.getCuponById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();
        Cupon c = existente.get();
        if (body.containsKey("activo")) c.setActivo(body.get("activo"));
        return ResponseEntity.ok(cuponDAO.saveOrUpdate(c));
    }

    // ── CLIENTE ───────────────────────────────────────────────────────────────

    /**
     * Valida un cupón dado su código y el subtotal del carrito.
     * Body: { "codigo": "DESC10", "subtotal": 150000 }
     * Devuelve el cupón con el descuento calculado si es válido.
     * Devuelve 422 con mensaje de error si no es aplicable.
     */
    @PostMapping("/validar")
    public ResponseEntity<?> validar(@RequestBody Map<String, Object> body) {
        String codigo   = (String) body.get("codigo");
        BigDecimal sub  = new BigDecimal(body.get("subtotal").toString());

        Optional<Cupon> opt = cuponDAO.getAllCupon().stream()
                .filter(c -> c.getCodigo().equalsIgnoreCase(codigo))
                .findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.status(422).body(Map.of("error", "Cupón no encontrado"));
        }

        Cupon c = opt.get();

        if (!Boolean.TRUE.equals(c.getActivo())) {
            return ResponseEntity.status(422).body(Map.of("error", "Este cupón no está activo"));
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (c.getVigenciaInicio() != null && ahora.isBefore(c.getVigenciaInicio())) {
            return ResponseEntity.status(422).body(Map.of("error", "El cupón aún no está vigente"));
        }
        if (c.getVigenciaFin() != null && ahora.isAfter(c.getVigenciaFin())) {
            return ResponseEntity.status(422).body(Map.of("error", "El cupón ha expirado"));
        }

        if (c.getMinimoCompra() != null && sub.compareTo(c.getMinimoCompra()) < 0) {
            return ResponseEntity.status(422).body(
                    Map.of("error", "El pedido mínimo para este cupón es $" + c.getMinimoCompra()));
        }

        if (c.getUsosMaximos() != null && c.getUsosActuales() >= c.getUsosMaximos()) {
            return ResponseEntity.status(422).body(Map.of("error", "El cupón ha alcanzado su límite de usos"));
        }

        // Calcular descuento
        BigDecimal descuento = calcularDescuento(c, sub);

        return ResponseEntity.ok(Map.of(
                "cupon"     , c,
                "descuento" , descuento,
                "mensaje"   , "Cupón aplicado correctamente"
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    private BigDecimal calcularDescuento(Cupon c, BigDecimal subtotal) {
        return switch (c.getTipo()) {
            case PORCENTAJE -> {
                BigDecimal desc = subtotal.multiply(c.getValor()).divide(BigDecimal.valueOf(100));
                if (c.getMaximoDescuento() != null && desc.compareTo(c.getMaximoDescuento()) > 0) {
                    yield c.getMaximoDescuento();
                }
                yield desc;
            }
            case MONTO_FIJO   -> c.getValor().min(subtotal);
            case ENVIO_GRATIS -> BigDecimal.ZERO; // el envío lo controla checkout
        };
    }
}