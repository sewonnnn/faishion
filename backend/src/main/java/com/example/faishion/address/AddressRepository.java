package com.example.faishion.address;

import com.example.faishion.user.User;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AddressRepository extends JpaRepository<Address,Long> {
    Address findByUser(User user);
}
