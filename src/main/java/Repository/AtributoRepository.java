package Repository;

import Model.Atributo;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtributoRepository extends CrudRepository<Atributo, Integer> {

}
