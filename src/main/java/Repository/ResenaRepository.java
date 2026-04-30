package Repository;

import Model.Resena;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResenaRepository extends CrudRepository<Resena, Integer> {

}
