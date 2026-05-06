package co.edu.unbosque.ecommerce_platform.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "usuario", schema = "ecommerce")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "apellido", length = 120)
    private String apellido;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "rol", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RolUsuario rol = RolUsuario.CLIENTE;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "email_verificado")
    private Boolean emailVerificado = false;

    @Column(name = "token_verificacion", length = 255)
    private String tokenVerificacion;

    @Column(name = "token_reset_pwd", length = 255)
    private String tokenResetPwd;

    @Column(name = "token_reset_exp")
    private LocalDateTime tokenResetExp;

    @Column(name = "proveedor_oauth", length = 30)
    private String proveedorOauth;

    @Column(name = "id_oauth", length = 255)
    private String idOauth;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DireccionEnvio> direcciones;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Pedido> pedidos;

    @JsonIgnore
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Carrito carrito;

    public enum RolUsuario {
        ADMIN, VENDEDOR, CLIENTE
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
