package Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "atributo_valor", schema = "ecommerce",
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_atributo", "valor"}))
public class AtributoValor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_valor")
    private Integer idValor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_atributo", nullable = false)
    private Atributo atributo;

    @Column(name = "valor", nullable = false, length = 120)
    private String valor;
}
