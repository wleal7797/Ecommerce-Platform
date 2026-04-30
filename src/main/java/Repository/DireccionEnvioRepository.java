package Repository;

import Model.DireccionEnvio;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DireccionEnvioRepository extends CrudRepository<DireccionEnvio, Integer> {

}
