package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.Message;
import org.backend.cleanersupportagentbackend.entity.MessageFeedback;
import org.backend.cleanersupportagentbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageFeedbackRepository extends JpaRepository<MessageFeedback, Long> {
    /**
     * 查找用户对某条消息的评价
     */
    Optional<MessageFeedback> findByMessageAndUser(Message message, User user);

    /**
     * 统计某条消息的赞数
     */
    @Query("SELECT COUNT(mf) FROM MessageFeedback mf WHERE mf.message = :message AND mf.type = 'like'")
    long countLikesByMessage(@Param("message") Message message);

    /**
     * 统计某条消息的踩数
     */
    @Query("SELECT COUNT(mf) FROM MessageFeedback mf WHERE mf.message = :message AND mf.type = 'dislike'")
    long countDislikesByMessage(@Param("message") Message message);

    /**
     * 检查用户是否已评价某条消息
     */
    boolean existsByMessageAndUser(Message message, User user);
}
