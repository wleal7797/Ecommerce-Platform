package co.edu.unbosque.ecommerce_platform.Services;

import co.edu.unbosque.ecommerce_platform.Model.Notificacion;
import co.edu.unbosque.ecommerce_platform.Repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificacionDAO {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion saveOrUpdate(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> getAllNotificacion() {
        return (List<Notificacion>) notificacionRepository.findAll();
    }

    public Optional<Notificacion> getNotificacionById(int id) {
        return notificacionRepository.findById(id);
    }

    public void deleteNotificacion(int id) {
        notificacionRepository.deleteById(id);
    }
}
