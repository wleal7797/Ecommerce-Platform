package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Envio;
import co.edu.unbosque.ecommerce_platform.Repository.EnvioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnvioDAO {

    @Autowired
    private EnvioRepository envioRepository;

    public Envio saveOrUpdate(Envio envio) {
        return envioRepository.save(envio);
    }

    public List<Envio> getAllEnvio() {
        return (List<Envio>) envioRepository.findAll();
    }

    public Optional<Envio> getEnvioById(int id) {
        return envioRepository.findById(id);
    }

    public void deleteEnvio(int id) {
        envioRepository.deleteById(id);
    }
}
