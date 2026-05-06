package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Cupon;
import co.edu.unbosque.ecommerce_platform.Repository.CuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CuponDAO {

    @Autowired
    private CuponRepository cuponRepository;

    public Cupon saveOrUpdate(Cupon cupon) {
        return cuponRepository.save(cupon);
    }

    public List<Cupon> getAllCupon() {
        return (List<Cupon>) cuponRepository.findAll();
    }

    public Optional<Cupon> getCuponById(int id) {
        return cuponRepository.findById(id);
    }

    public void deleteCupon(int id) {
        cuponRepository.deleteById(id);
    }
}
