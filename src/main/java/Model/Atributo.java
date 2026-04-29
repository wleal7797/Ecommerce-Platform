package Model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "atributo", schema = "ecommerce")
public class Atributo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atributo")
    private Integer idAtributo;

    @Column(name = "nombre", nullable = false, unique = true, length = 80)
    private String nombre;

    @OneToMany(mappedBy = "atributo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AtributoValor> valores;
}
