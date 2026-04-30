package Repository;

import Model.MovimientoInventario;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimientoInventarioRepository extends CrudRepository<MovimientoInventario, Integer> {

}
