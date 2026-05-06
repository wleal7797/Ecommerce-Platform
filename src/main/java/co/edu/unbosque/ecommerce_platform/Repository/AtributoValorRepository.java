package co.edu.unbosque.ecommerce_platform.Repository;

import co.edu.unbosque.ecommerce_platform.Model.AtributoValor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AtributoValorRepository extends CrudRepository<AtributoValor, Integer> {

}
