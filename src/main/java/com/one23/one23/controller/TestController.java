package com.one23.one23.controller;

import com.one23.one23.model.RideRequest;
import com.one23.one23.repository.RideRequestRepository;
import com.one23.one23.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private RideRequestRepository repo;

    @Autowired
    private MatchingService matchingService;

    @PostMapping("/join")
    public RideRequest createRide(@RequestBody RideRequest rideRequest) {
      
            rideRequest.setCreatedAt(LocalDateTime.now());
            rideRequest.setStatus("WAITING");
            rideRequest.setGroupId(null);
        
        RideRequest saved = repo.save(rideRequest);
        matchingService.addAndMatch(saved);
        return saved;
    }
}

