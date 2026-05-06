package co.edu.unbosque.ecommerce_platform.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "envio", schema = "ecommerce")
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_envio")
    private Integer idEnvio;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Column(name = "transportadora", length = 80)
    private String transportadora;

    @Column(name = "numero_guia", length = 120)
    private String numeroGuia;

    @Column(name = "estado", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private EstadoEnvio estado = EstadoEnvio.PENDIENTE;

    @Column(name = "fecha_despacho")
    private LocalDateTime fechaDespacho;

    @Column(name = "fecha_entrega_est")
    private LocalDate fechaEntregaEst;

    @Column(name = "fecha_entrega_real")
    private LocalDateTime fechaEntregaReal;

    @Column(name = "url_rastreo", columnDefinition = "TEXT")
    private String urlRastreo;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public enum EstadoEnvio {
        PENDIENTE, PREPARANDO, EN_TRANSITO, ENTREGADO, DEVUELTO
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
