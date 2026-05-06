package co.edu.unbosque.ecommerce_platform.Repository;
import co.edu.unbosque.ecommerce_platform.Model.Usuario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Integer> {

}
