package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "direccion_envio", schema = "ecommerce")
public class DireccionEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Integer idDireccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "etiqueta", length = 50)
    private String etiqueta = "Casa";

    @Column(name = "destinatario", nullable = false, length = 150)
    private String destinatario;

    @Column(name = "linea1", nullable = false, length = 200)
    private String linea1;

    @Column(name = "linea2", length = 200)
    private String linea2;

    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;

    @Column(name = "pais", length = 2)
    private String pais = "CO";

    @Column(name = "predeterminada")
    private Boolean predeterminada = false;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    public void prePersist() {
        creadoEn = LocalDateTime.now();
    }
}
