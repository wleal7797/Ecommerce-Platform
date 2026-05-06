package co.edu.unbosque.ecommerce_platform.Repository;

import co.edu.unbosque.ecommerce_platform.Model.HistorialPedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialPedidoRepository extends CrudRepository<HistorialPedido, Integer> {

}
