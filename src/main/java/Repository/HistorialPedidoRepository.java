package Repository;

import Model.HistorialPedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialPedidoRepository extends CrudRepository<HistorialPedido, Integer> {

}
