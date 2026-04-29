package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "carrito_item", schema = "ecommerce",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_carrito", "id_producto"}))
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Integer idItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carrito", nullable = false)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Column(name = "agregado_en", updatable = false)
    private LocalDateTime agregadoEn;

    @PrePersist
    public void prePersist() {
        agregadoEn = LocalDateTime.now();
    }
}
