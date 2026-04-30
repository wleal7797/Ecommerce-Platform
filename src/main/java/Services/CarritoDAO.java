package Services;

import Model.Carrito;
import Repository.CarritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarritoDAO {

    @Autowired
    private CarritoRepository carritoRepository;

    public Carrito saveOrUpdate(Carrito carrito) {
        return carritoRepository.save(carrito);
    }

    public List<Carrito> getAllCarrito() {
        return (List<Carrito>) carritoRepository.findAll();
    }

    public Optional<Carrito> getCarritoById(int id) {
        return carritoRepository.findById(id);
    }

    public void deleteCarrito(int id) {
        carritoRepository.deleteById(id);
    }
}
