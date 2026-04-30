package Repository;

import Model.CuponUsuario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuponUsuarioRepository extends CrudRepository<CuponUsuario, Integer> {

}
