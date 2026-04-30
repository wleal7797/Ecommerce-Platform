package Repository;

import Model.Envio;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnvioRepository extends CrudRepository<Envio, Integer> {

}
