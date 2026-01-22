package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.ImageRecognition;
import org.backend.cleanersupportagentbackend.entity.RecognitionStatus;
import org.backend.cleanersupportagentbackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImageRecognitionRepository extends JpaRepository<ImageRecognition, Long> {
    Optional<ImageRecognition> findByRecognitionId(String recognitionId);
    
    Page<ImageRecognition> findByUser(User user, Pageable pageable);
    
    @Query("SELECT ir FROM ImageRecognition ir WHERE ir.user = :user AND " +
           "(:status IS NULL OR ir.status = :status)")
    Page<ImageRecognition> findByUserAndStatus(@Param("user") User user, 
                                                @Param("status") RecognitionStatus status, 
                                                Pageable pageable);
}
