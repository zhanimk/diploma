package com.judo.competition.service;

import com.judo.competition.model.Registration;
import com.judo.competition.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;

    @Autowired
    public RegistrationService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public Optional<Registration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    public List<Registration> getRegistrationsByTournamentId(Long tournamentId) {
        return registrationRepository.findByTournamentId(tournamentId);
    }

    public List<Registration> getRegistrationsByUserId(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public Registration createRegistration(Registration registration) {
        // Add validation logic here
        return registrationRepository.save(registration);
    }

    public Registration updateRegistration(Long id, Registration registrationDetails) {
        Registration registration = registrationRepository.findById(id).orElseThrow(() -> new RuntimeException("Registration not found"));
        registration.setStatus(registrationDetails.getStatus());
        return registrationRepository.save(registration);
    }

    public void deleteRegistration(Long id) {
        registrationRepository.deleteById(id);
    }
}
