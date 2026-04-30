package Services;

import Model.AtributoValor;
import Repository.AtributoValorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AtributoValorDAO {

    @Autowired
    private AtributoValorRepository atributoValorRepository;

    public AtributoValor saveOrUpdate(AtributoValor atributoValor) {
        return atributoValorRepository.save(atributoValor);
    }

    public List<AtributoValor> getAllAtributoValor() {
        return (List<AtributoValor>) atributoValorRepository.findAll();
    }

    public Optional<AtributoValor> getAtributoValorById(int id) {
        return atributoValorRepository.findById(id);
    }

    public void deleteAtributoValor(int id) {
        atributoValorRepository.deleteById(id);
    }
}
