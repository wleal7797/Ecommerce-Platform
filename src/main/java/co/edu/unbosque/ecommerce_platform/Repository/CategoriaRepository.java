package co.edu.unbosque.ecommerce_platform.Repository;

import co.edu.unbosque.ecommerce_platform.Model.Categoria;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends CrudRepository<Categoria, Integer> {

}
