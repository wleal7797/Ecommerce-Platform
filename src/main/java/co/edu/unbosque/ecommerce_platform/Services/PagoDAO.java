package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Pago;
import co.edu.unbosque.ecommerce_platform.Repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PagoDAO {

    @Autowired
    private PagoRepository pagoRepository;

    public Pago saveOrUpdate(Pago pago) {
        return pagoRepository.save(pago);
    }

    public List<Pago> getAllPago() {
        return (List<Pago>) pagoRepository.findAll();
    }

    public Optional<Pago> getPagoById(int id) {
        return pagoRepository.findById(id);
    }

    public void deletePago(int id) {
        pagoRepository.deleteById(id);
    }
}
