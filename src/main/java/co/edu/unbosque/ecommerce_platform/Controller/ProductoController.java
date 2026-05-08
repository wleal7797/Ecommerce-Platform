package co.edu.unbosque.ecommerce_platform.Controller;

import co.edu.unbosque.ecommerce_platform.Model.Producto;
import co.edu.unbosque.ecommerce_platform.Services.ProductoDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * ProductoController
 *
 * Rutas:
 *   GET    /api/productos              → lista todos los productos (cliente y admin)
 *   GET    /api/productos/{id}         → detalle de un producto
 *   GET    /api/productos/activos      → solo productos activos (para vitrina cliente)
 *   GET    /api/productos/destacados   → productos marcados como destacados
 *   POST   /api/productos              → crear producto (admin)
 *   PUT    /api/productos/{id}         → actualizar producto completo (admin)
 *   PATCH  /api/productos/{id}/toggle  → activar / desactivar producto (admin)
 *   DELETE /api/productos/{id}         → eliminar producto (admin)
 */
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoDAO productoDAO;

    // ─────────────────────────────────────────────
    // RUTAS COMPARTIDAS (cliente y admin)
    // ─────────────────────────────────────────────

    /** Lista TODOS los productos — usada en el panel admin */
    @GetMapping
    public ResponseEntity<List<Producto>> getAll() {
        List<Producto> lista = productoDAO.getAllProducto();
        return ResponseEntity.ok(lista);
    }

    /** Detalle de un producto por ID */
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable int id) {
        Optional<Producto> producto = productoDAO.getProductoById(id);
        return producto
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Solo productos activos — vitrina para clientes */
    @GetMapping("/activos")
    public ResponseEntity<List<Producto>> getActivos() {
        List<Producto> todos = productoDAO.getAllProducto();
        List<Producto> activos = todos.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo()))
                .toList();
        return ResponseEntity.ok(activos);
    }

    /** Productos destacados — para sección "featured" en vitrina */
    @GetMapping("/destacados")
    public ResponseEntity<List<Producto>> getDestacados() {
        List<Producto> todos = productoDAO.getAllProducto();
        List<Producto> destacados = todos.stream()
                .filter(p -> Boolean.TRUE.equals(p.getActivo())
                        && Boolean.TRUE.equals(p.getDestacado()))
                .toList();
        return ResponseEntity.ok(destacados);
    }

    // ─────────────────────────────────────────────
    // RUTAS ADMIN
    // ─────────────────────────────────────────────

    /** Crear un nuevo producto */
    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        try {
            Producto guardado = productoDAO.saveOrUpdate(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /** Actualizar un producto existente */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable int id,
                                               @RequestBody Producto datos) {
        Optional<Producto> existente = productoDAO.getProductoById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Producto p = existente.get();
        p.setNombre(datos.getNombre());
        p.setSlug(datos.getSlug());
        p.setDescripcion(datos.getDescripcion());
        p.setDescripcionCorta(datos.getDescripcionCorta());
        p.setPrecio(datos.getPrecio());
        p.setPrecioOferta(datos.getPrecioOferta());
        p.setSku(datos.getSku());
        p.setCodigoBarras(datos.getCodigoBarras());
        p.setStock(datos.getStock());
        p.setStockMinimo(datos.getStockMinimo());
        p.setPesoKg(datos.getPesoKg());
        p.setAltoCm(datos.getAltoCm());
        p.setAnchoCm(datos.getAnchoCm());
        p.setLargoCm(datos.getLargoCm());
        p.setActivo(datos.getActivo());
        p.setDestacado(datos.getDestacado());
        p.setPermiteResenas(datos.getPermiteResenas());
        p.setMetaTitulo(datos.getMetaTitulo());
        p.setMetaDescripcion(datos.getMetaDescripcion());

        return ResponseEntity.ok(productoDAO.saveOrUpdate(p));
    }

    /**
     * Activar / desactivar un producto sin reenviar todos los campos.
     * Body esperado: { "activo": true } o { "activo": false }
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Producto> toggleActivo(@PathVariable int id,
                                                 @RequestBody java.util.Map<String, Boolean> body) {
        Optional<Producto> existente = productoDAO.getProductoById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        Producto p = existente.get();
        Boolean nuevoEstado = body.get("activo");
        if (nuevoEstado != null) p.setActivo(nuevoEstado);

        return ResponseEntity.ok(productoDAO.saveOrUpdate(p));
    }

    /** Eliminar un producto */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable int id) {
        Optional<Producto> existente = productoDAO.getProductoById(id);
        if (existente.isEmpty()) return ResponseEntity.notFound().build();

        productoDAO.deleteProducto(id);
        return ResponseEntity.noContent().build();
    }
}
