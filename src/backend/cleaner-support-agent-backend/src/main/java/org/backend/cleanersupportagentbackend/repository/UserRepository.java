package org.backend.cleanersupportagentbackend.repository;

import org.backend.cleanersupportagentbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByUserId(String userId);
}
