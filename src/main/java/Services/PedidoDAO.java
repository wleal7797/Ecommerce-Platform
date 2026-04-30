package Services;

import Model.Pedido;
import Repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidoDAO {

    @Autowired
    private PedidoRepository pedidoRepository;

    public Pedido saveOrUpdate(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> getAllPedido() {
        return (List<Pedido>) pedidoRepository.findAll();
    }

    public Optional<Pedido> getPedidoById(int id) {
        return pedidoRepository.findById(id);
    }

    public void deletePedido(int id) {
        pedidoRepository.deleteById(id);
    }
}
