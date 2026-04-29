package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resena", schema = "ecommerce",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_producto", "id_usuario"}))
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resena")
    private Integer idResena;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // SMALLINT en PostgreSQL → Short en Java — rango 1 a 5
    @Column(name = "calificacion", nullable = false)
    private Short calificacion;

    @Column(name = "titulo", length = 150)
    private String titulo;

    @Column(name = "cuerpo", columnDefinition = "TEXT")
    private String cuerpo;

    // TRUE = compra verificada por pedido real
    @Column(name = "verificada")
    private Boolean verificada = false;

    @Column(name = "aprobada")
    private Boolean aprobada = true;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }
}
