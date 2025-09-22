package com.example.faishion.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    //boolean existByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String username);
    Optional<User> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);

    boolean existsByPhoneNumber(String phoneNumber);

}