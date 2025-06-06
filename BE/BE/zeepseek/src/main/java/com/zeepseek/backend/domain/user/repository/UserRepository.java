package com.zeepseek.backend.domain.user.repository;

import com.zeepseek.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findByRefreshToken(String refreshToken);
}