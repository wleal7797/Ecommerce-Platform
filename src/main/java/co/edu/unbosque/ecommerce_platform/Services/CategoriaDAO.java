package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Categoria;
import co.edu.unbosque.ecommerce_platform.Repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaDAO {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public Categoria saveOrUpdate(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public List<Categoria> getAllCategoria() {
        return (List<Categoria>) categoriaRepository.findAll();
    }

    public Optional<Categoria> getCategoriaById(int id) {
        return categoriaRepository.findById(id);
    }

    public void deleteCategoria(int id) {
        categoriaRepository.deleteById(id);
    }
}
