package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cupon", schema = "ecommerce")
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cupon")
    private Integer idCupon;

    @Column(name = "codigo", unique = true, nullable = false, length = 50)
    private String codigo;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "tipo", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoCupon tipo;

    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor = BigDecimal.ZERO;

    @Column(name = "minimo_compra", precision = 14, scale = 2)
    private BigDecimal minimoCompra = BigDecimal.ZERO;

    @Column(name = "maximo_descuento", precision = 14, scale = 2)
    private BigDecimal maximoDescuento;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_actuales", nullable = false)
    private Integer usosActuales = 0;

    @Column(name = "usos_por_usuario")
    private Integer usosPorUsuario = 1;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "vigencia_inicio")
    private LocalDateTime vigenciaInicio;

    @Column(name = "vigencia_fin")
    private LocalDateTime vigenciaFin;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    public enum TipoCupon {
        PORCENTAJE, MONTO_FIJO, ENVIO_GRATIS
    }

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }
}
