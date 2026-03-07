package com.judo.competition.repository;

import com.judo.competition.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByTournamentId(Long tournamentId);

    List<Registration> findByUserId(Long userId);

}
