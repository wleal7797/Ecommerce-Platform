package Services;

import Model.MovimientoInventario;
import Repository.MovimientoInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MovimientoInventarioDAO {

    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    public MovimientoInventario saveOrUpdate(MovimientoInventario movimientoInventario) {
        return movimientoInventarioRepository.save(movimientoInventario);
    }

    public List<MovimientoInventario> getAllMovimientoInventario() {
        return (List<MovimientoInventario>) movimientoInventarioRepository.findAll();
    }

    public Optional<MovimientoInventario> getMovimientoInventarioById(int id) {
        return movimientoInventarioRepository.findById(id);
    }

    public void deleteMovimientoInventario(int id) {
        movimientoInventarioRepository.deleteById(id);
    }
}
