package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Atributo;
import co.edu.unbosque.ecommerce_platform.Repository.AtributoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AtributoDAO {

    @Autowired
    private AtributoRepository atributoRepository;

    public Atributo saveOrUpdate(Atributo atributo) {
        return atributoRepository.save(atributo);
    }

    public List<Atributo> getAllAtributo() {
        return (List<Atributo>) atributoRepository.findAll();
    }

    public Optional<Atributo> getAtributoById(int id) {
        return atributoRepository.findById(id);
    }

    public void deleteAtributo(int id) {
        atributoRepository.deleteById(id);
    }
}
