package Repository;

import Model.DetallePedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetallePedidoRepository extends CrudRepository<DetallePedido, Integer> {

}
