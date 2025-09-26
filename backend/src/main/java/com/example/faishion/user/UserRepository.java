package com.example.faishion.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

//    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);

    String providerUserId(String providerUserId);
}