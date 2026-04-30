package Repository;

import Model.ImagenProducto;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagenProductoRepository extends CrudRepository<ImagenProducto, Integer> {

}
