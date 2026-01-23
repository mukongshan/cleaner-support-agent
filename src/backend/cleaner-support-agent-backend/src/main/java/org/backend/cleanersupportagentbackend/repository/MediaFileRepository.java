package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    Optional<MediaFile> findByFileId(String fileId);
    
    List<MediaFile> findByCategory(String category);
    
    @Query("SELECT m FROM MediaFile m WHERE " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:query IS NULL OR m.title LIKE %:query%)")
    List<MediaFile> searchByCategoryAndQuery(@Param("category") String category, 
                                              @Param("query") String query);
}
