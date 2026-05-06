package co.edu.unbosque.ecommerce_platform.Repository;

import co.edu.unbosque.ecommerce_platform.Model.Notificacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacionRepository extends CrudRepository<Notificacion, Integer> {

}
