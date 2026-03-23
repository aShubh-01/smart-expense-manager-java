package com.expensetracker.controller;

import com.expensetracker.model.UserProfile;
import com.expensetracker.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileRepository profileRepository;

    @GetMapping
    public UserProfile getProfile(@RequestHeader("X-User-Id") String userId) {
        return profileRepository.findByUserId(userId)
                .orElse(new UserProfile(null, userId, 0.0, 0.0, 0.0, "No profile set", "Moderate"));
    }

    @PostMapping
    public UserProfile updateProfile(@RequestHeader("X-User-Id") String userId, @RequestBody UserProfile profile) {
        profile.setUserId(userId); // Ensure correct userId is set
        
        // Find existing profile and set its id to ensure we update instead of creating a new one
        profileRepository.findByUserId(userId).ifPresent(p -> profile.setId(p.getId()));
        
        return profileRepository.save(profile);
    }
}
