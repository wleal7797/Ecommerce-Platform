package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.ImagenProducto;
import co.edu.unbosque.ecommerce_platform.Repository.ImagenProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImagenProductoDAO {

    @Autowired
    private ImagenProductoRepository imagenProductoRepository;

    public ImagenProducto saveOrUpdate(ImagenProducto imagenProducto) {
        return imagenProductoRepository.save(imagenProducto);
    }

    public List<ImagenProducto> getAllImagenProducto() {
        return (List<ImagenProducto>) imagenProductoRepository.findAll();
    }

    public Optional<ImagenProducto> getImagenProductoById(int id) {
        return imagenProductoRepository.findById(id);
    }

    public void deleteImagenProducto(int id) {
        imagenProductoRepository.deleteById(id);
    }
}
