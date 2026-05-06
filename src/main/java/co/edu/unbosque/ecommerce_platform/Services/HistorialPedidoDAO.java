package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.HistorialPedido;
import co.edu.unbosque.ecommerce_platform.Repository.HistorialPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistorialPedidoDAO {

    @Autowired
    private HistorialPedidoRepository historialPedidoRepository;

    public HistorialPedido saveOrUpdate(HistorialPedido historialPedido) {
        return historialPedidoRepository.save(historialPedido);
    }

    public List<HistorialPedido> getAllHistorialPedido() {
        return (List<HistorialPedido>) historialPedidoRepository.findAll();
    }

    public Optional<HistorialPedido> getHistorialPedidoById(int id) {
        return historialPedidoRepository.findById(id);
    }

    public void deleteHistorialPedido(int id) {
        historialPedidoRepository.deleteById(id);
    }
}
