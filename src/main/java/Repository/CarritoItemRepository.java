package Repository;

import Model.CarritoItem;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarritoItemRepository extends CrudRepository<CarritoItem, Integer> {

}
