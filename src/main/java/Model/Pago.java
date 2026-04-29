package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pago", schema = "ecommerce")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Column(name = "referencia", unique = true, nullable = false, length = 150)
    private String referencia;

    // Proveedor: WOMPI, PAYU, STRIPE, PSE
    @Column(name = "proveedor", nullable = false, length = 50)
    private String proveedor;

    // Método: TARJETA_CREDITO, PSE, EFECTIVO, NEQUI
    @Column(name = "metodo", nullable = false, length = 50)
    private String metodo;

    @Column(name = "estado", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private EstadoPago estado = EstadoPago.PENDIENTE;

    @Column(name = "monto", nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(name = "moneda", length = 3)
    private String moneda = "COP";

    // Respuesta raw del proveedor de pagos (JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public enum EstadoPago {
        PENDIENTE, APROBADO, RECHAZADO, REEMBOLSADO
    }

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
        actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
}
