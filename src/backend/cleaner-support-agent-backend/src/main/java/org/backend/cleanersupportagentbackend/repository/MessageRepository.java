package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.Conversation;
import org.backend.cleanersupportagentbackend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);

    void deleteByConversation(Conversation conversation);
}
