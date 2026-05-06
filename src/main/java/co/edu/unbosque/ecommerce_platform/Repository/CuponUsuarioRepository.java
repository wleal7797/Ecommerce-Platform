package co.edu.unbosque.ecommerce_platform.Repository;

import co.edu.unbosque.ecommerce_platform.Model.CuponUsuario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuponUsuarioRepository extends CrudRepository<CuponUsuario, Integer> {

}
