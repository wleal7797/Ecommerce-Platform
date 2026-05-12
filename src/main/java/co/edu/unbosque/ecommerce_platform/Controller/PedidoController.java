package co.edu.unbosque.ecommerce_platform.Controller;

import co.edu.unbosque.ecommerce_platform.Model.Pedido;
import co.edu.unbosque.ecommerce_platform.Model.Pedido.EstadoPedido;
import co.edu.unbosque.ecommerce_platform.Services.PedidoDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * PedidoController
 *
 * Rutas públicas (cliente autenticado):
 *   GET  /api/pedidos/usuario/{idUsuario}      → pedidos de ese usuario
 *   GET  /api/pedidos/{id}                     → detalle de un pedido
 *   POST /api/pedidos                          → crear pedido (checkout)
 *   POST /api/pedidos/{id}/cancelar            → cliente cancela su pedido
 *
 * Rutas admin:
 *   GET   /api/pedidos                         → todos los pedidos
 *   PATCH /api/pedidos/{id}/estado             → cambiar estado
 *   GET   /api/pedidos/estado/{estado}         → filtrar por estado
 */
@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoDAO pedidoDAO;

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    /** Lista TODOS los pedidos (para el panel admin) */
    @GetMapping
    public ResponseEntity<List<Pedido>> getAll() {
        return ResponseEntity.ok(pedidoDAO.getAllPedido());
    }

    /** Filtra pedidos por estado */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Pedido>> getByEstado(@PathVariable String estado) {
        try {
            EstadoPedido ep = EstadoPedido.valueOf(estado.toUpperCase());
            List<Pedido> lista = pedidoDAO.getAllPedido().stream()
                    .filter(p -> p.getEstado() == ep)
                    .toList();
            return ResponseEntity.ok(lista);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Cambia el estado de un pedido.
     * Body esperado: { "estado": "CONFIRMADO" }
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable int id,
                                                @RequestBody Map<String, String> body) {
        Optional<Pedido> existente = pedidoDAO.getPedidoById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        try {
            EstadoPedido nuevoEstado = EstadoPedido.valueOf(body.get("estado").toUpperCase());
            Pedido p = existente.get();
            p.setEstado(nuevoEstado);
            return ResponseEntity.ok(pedidoDAO.saveOrUpdate(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLIENTE
    // ─────────────────────────────────────────────────────────────────────────

    /** Detalle de un pedido específico */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable int id) {
        return pedidoDAO.getPedidoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Pedidos de un usuario (historial del cliente) */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Pedido>> getByUsuario(@PathVariable int idUsuario) {
        List<Pedido> lista = pedidoDAO.getAllPedido().stream()
                .filter(p -> p.getUsuario() != null
                        && p.getUsuario().getIdUsuario() == idUsuario)
                .toList();
        return ResponseEntity.ok(lista);
    }

    /**
     * Crear un nuevo pedido (checkout).
     * El body debe incluir idUsuario, idDireccion, items, totales, etc.
     * La lógica de negocio (calcular totales, descontar stock, aplicar cupón)
     * debe ir en el Service (PedidoDAO / PedidoService).
     */
    @PostMapping
    public ResponseEntity<Pedido> crear(@RequestBody Pedido pedido) {
        try {
            // Generar número de orden único si no viene desde el front
            if (pedido.getNumeroOrden() == null || pedido.getNumeroOrden().isBlank()) {
                pedido.setNumeroOrden(generarNumeroOrden());
            }
            Pedido guardado = pedidoDAO.saveOrUpdate(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /** El cliente puede cancelar su pedido solo si está en PENDIENTE o CONFIRMADO */
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelar(@PathVariable int id) {
        Optional<Pedido> existente = pedidoDAO.getPedidoById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Pedido p = existente.get();
        if (p.getEstado() != EstadoPedido.PENDIENTE
                && p.getEstado() != EstadoPedido.CONFIRMADO) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409
        }

        p.setEstado(EstadoPedido.CANCELADO);
        return ResponseEntity.ok(pedidoDAO.saveOrUpdate(p));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String generarNumeroOrden() {
        return "ORD-" + System.currentTimeMillis();
    }
}