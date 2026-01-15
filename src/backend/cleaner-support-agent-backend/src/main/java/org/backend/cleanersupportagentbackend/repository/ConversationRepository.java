package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.Conversation;
import org.backend.cleanersupportagentbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByConversationId(String conversationId);
    List<Conversation> findByUserOrderByUpdatedAtDesc(User user);
}
