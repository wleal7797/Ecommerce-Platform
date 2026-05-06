package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Producto;
import co.edu.unbosque.ecommerce_platform.Repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoDAO {

    @Autowired
    private ProductoRepository productoRepository;

    public Producto saveOrUpdate(Producto producto) {
        return productoRepository.save(producto);
    }

    public List<Producto> getAllProducto() {
        return (List<Producto>) productoRepository.findAll();
    }

    public Optional<Producto> getProductoById(int id) {
        return productoRepository.findById(id);
    }

    public void deleteProducto(int id) {
        productoRepository.deleteById(id);
    }
}
