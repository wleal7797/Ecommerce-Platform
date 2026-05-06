package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Resena;
import co.edu.unbosque.ecommerce_platform.Repository.ResenaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResenaDAO {

    @Autowired
    private ResenaRepository resenaRepository;

    public Resena saveOrUpdate(Resena resena) {
        return resenaRepository.save(resena);
    }

    public List<Resena> getAllResena() {
        return (List<Resena>) resenaRepository.findAll();
    }

    public Optional<Resena> getResenaById(int id) {
        return resenaRepository.findById(id);
    }

    public void deleteResena(int id) {
        resenaRepository.deleteById(id);
    }
}
