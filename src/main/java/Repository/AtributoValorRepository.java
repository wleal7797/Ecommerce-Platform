package Repository;

import Model.AtributoValor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtributoValorRepository extends CrudRepository<AtributoValor, Integer> {

}
