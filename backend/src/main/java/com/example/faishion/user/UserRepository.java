package com.example.faishion.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);

    // id가 곧 loginId 역할
    boolean existsById(String id);
    boolean existsByLoginId(String loginId);

    Optional<User> findById(String id);

    Optional<User> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);

    Optional<User> findByLoginId(String loginId);
}