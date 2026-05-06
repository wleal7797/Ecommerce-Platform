package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.CarritoItem;
import co.edu.unbosque.ecommerce_platform.Repository.CarritoItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarritoItemDAO {

    @Autowired
    private CarritoItemRepository carritoItemRepository;

    public CarritoItem saveOrUpdate(CarritoItem carritoItem) {
        return carritoItemRepository.save(carritoItem);
    }

    public List<CarritoItem> getAllCarritoItem() {
        return (List<CarritoItem>) carritoItemRepository.findAll();
    }

    public Optional<CarritoItem> getCarritoItemById(int id) {
        return carritoItemRepository.findById(id);
    }

    public void deleteCarritoItem(int id) {
        carritoItemRepository.deleteById(id);
    }
}
