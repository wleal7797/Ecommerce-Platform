package co.edu.unbosque.ecommerce_platform.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "producto", schema = "ecommerce")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer idProducto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    @JsonIgnore
    private Categoria categoria;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "slug", unique = true, length = 220)
    private String slug;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "descripcion_corta", length = 500)
    private String descripcionCorta;

    @Column(name = "precio", nullable = false, precision = 14, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_oferta", precision = 14, scale = 2)
    private BigDecimal precioOferta;

    @Column(name = "sku", unique = true, nullable = false, length = 80)
    private String sku;

    @Column(name = "codigo_barras", length = 80)
    private String codigoBarras;

    @Column(name = "stock", nullable = false)
    private Integer stock = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Column(name = "peso_kg", precision = 8, scale = 3)
    private BigDecimal pesoKg;

    @Column(name = "alto_cm", precision = 8, scale = 2)
    private BigDecimal altoCm;

    @Column(name = "ancho_cm", precision = 8, scale = 2)
    private BigDecimal anchoCm;

    @Column(name = "largo_cm", precision = 8, scale = 2)
    private BigDecimal largoCm;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "destacado")
    private Boolean destacado = false;

    @Column(name = "permite_resenas")
    private Boolean permiteResenas = true;

    @Column(name = "calificacion_prom", precision = 3, scale = 2)
    private BigDecimal calificacionProm = BigDecimal.ZERO;

    @Column(name = "total_resenas")
    private Integer totalResenas = 0;

    @Column(name = "total_vendidos")
    private Integer totalVendidos = 0;

    @Column(name = "meta_titulo", length = 160)
    private String metaTitulo;

    @Column(name = "meta_descripcion", length = 320)
    private String metaDescripcion;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @JsonIgnore
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImagenProducto> imagenes;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "producto_atributo", schema = "ecommerce",
        joinColumns = @JoinColumn(name = "id_producto"),
        inverseJoinColumns = @JoinColumn(name = "id_valor")
    )
    private List<AtributoValor> atributos;

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
