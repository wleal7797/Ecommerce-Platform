package Services;

import Model.DetallePedido;
import Repository.DetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetallePedidoDAO {

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;

    public DetallePedido saveOrUpdate(DetallePedido detallePedido) {
        return detallePedidoRepository.save(detallePedido);
    }

    public List<DetallePedido> getAllDetallePedido() {
        return (List<DetallePedido>) detallePedidoRepository.findAll();
    }

    public Optional<DetallePedido> getDetallePedidoById(int id) {
        return detallePedidoRepository.findById(id);
    }

    public void deleteDetallePedido(int id) {
        detallePedidoRepository.deleteById(id);
    }
}
