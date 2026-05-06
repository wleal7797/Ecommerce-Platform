package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.CuponUsuario;
import co.edu.unbosque.ecommerce_platform.Repository.CuponUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CuponUsuarioDAO {

    @Autowired
    private CuponUsuarioRepository cuponUsuarioRepository;

    public CuponUsuario saveOrUpdate(CuponUsuario cuponUsuario) {
        return cuponUsuarioRepository.save(cuponUsuario);
    }

    public List<CuponUsuario> getAllCuponUsuario() {
        return (List<CuponUsuario>) cuponUsuarioRepository.findAll();
    }

    public Optional<CuponUsuario> getCuponUsuarioById(int id) {
        return cuponUsuarioRepository.findById(id);
    }

    public void deleteCuponUsuario(int id) {
        cuponUsuarioRepository.deleteById(id);
    }
}
