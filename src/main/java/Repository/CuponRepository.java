package Repository;

import Model.Cupon;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CuponRepository extends CrudRepository<Cupon, Integer> {

}
