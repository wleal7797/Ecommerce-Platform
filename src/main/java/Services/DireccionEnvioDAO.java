package Services;

import Model.DireccionEnvio;
import Repository.DireccionEnvioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DireccionEnvioDAO {

    @Autowired
    private DireccionEnvioRepository direccionEnvioRepository;

    public DireccionEnvio saveOrUpdate(DireccionEnvio direccionEnvio) {
        return direccionEnvioRepository.save(direccionEnvio);
    }

    public List<DireccionEnvio> getAllDireccionEnvio() {
        return (List<DireccionEnvio>) direccionEnvioRepository.findAll();
    }

    public Optional<DireccionEnvio> getDireccionEnvioById(int id) {
        return direccionEnvioRepository.findById(id);
    }

    public void deleteDireccionEnvio(int id) {
        direccionEnvioRepository.deleteById(id);
    }
}
