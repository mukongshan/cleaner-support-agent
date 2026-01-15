package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.Ticket;
import org.backend.cleanersupportagentbackend.entity.Ticket.TicketStatus;
import org.backend.cleanersupportagentbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketId(String ticketId);
    List<Ticket> findByUserOrderByCreatedAtDesc(User user);
    List<Ticket> findByUserAndStatusOrderByCreatedAtDesc(User user, TicketStatus status);
}
