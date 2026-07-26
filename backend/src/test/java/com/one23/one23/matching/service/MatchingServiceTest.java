package com.one23.one23.matching.service;

import com.one23.one23.ride.model.RideRequest;
import com.one23.one23.ride.repository.RideRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private RideRequestRepository rideRequestRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MatchingService matchingService;

    private RideRequest ride(String pickupHub, String destination) {
        RideRequest ride = new RideRequest();
        ride.setPickupHub(pickupHub);
        ride.setDestination(destination);
        ride.setStatus("WAITING");
        return ride;
    }

    @Test
    void addAndMatch_rejectsBlankPickupHub() {
        RideRequest request = ride("", "Airport");

        assertThatThrownBy(() -> matchingService.addAndMatch(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("pickupHub is required");

        verifyNoInteractions(rideRequestRepository, messagingTemplate);
    }

    @Test
    void addAndMatch_rejectsBlankDestination() {
        RideRequest request = ride("Downtown", " ");

        assertThatThrownBy(() -> matchingService.addAndMatch(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("destination is required");
    }

    @Test
    void addAndMatch_returnsNullWhenFewerThanThreeWaiting() {
        RideRequest incoming = ride("Downtown", "Airport");
        when(rideRequestRepository.findByStatus("WAITING"))
                .thenReturn(List.of(ride("Downtown", "Airport"), ride("Downtown", "Airport")));

        List<RideRequest> result = matchingService.addAndMatch(incoming);

        assertThat(result).isNull();
        verifyNoInteractions(messagingTemplate);
        verify(rideRequestRepository, never()).saveAll(any());
    }

    @Test
    void addAndMatch_ignoresRidesAtDifferentHubOrDestination() {
        RideRequest incoming = ride("Downtown", "Airport");
        List<RideRequest> waiting = List.of(
                ride("Downtown", "Airport"),
                ride("Downtown", "Airport"),
                ride("Downtown", "Mall"),      // different destination — should not count
                ride("Uptown", "Airport")      // different hub — should not count
        );
        when(rideRequestRepository.findByStatus("WAITING")).thenReturn(waiting);

        List<RideRequest> result = matchingService.addAndMatch(incoming);

        assertThat(result).isNull();
    }

    @Test
    void addAndMatch_matchesThreeRidersCaseInsensitively_andBroadcasts() {
        RideRequest incoming = ride("downtown", "airport");
        List<RideRequest> waiting = List.of(
                ride("Downtown", "Airport"),
                ride(" DOWNTOWN ", " AIRPORT "),
                ride("downtown", "airport")
        );
        when(rideRequestRepository.findByStatus("WAITING")).thenReturn(waiting);
        when(rideRequestRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        List<RideRequest> result = matchingService.addAndMatch(incoming);

        assertThat(result).hasSize(3);
        assertThat(result).allSatisfy(ride -> {
            assertThat(ride.getStatus()).isEqualTo("MATCHED");
            assertThat(ride.getGroupId()).isNotBlank();
        });
        // All three matched rides share the same generated group id
        assertThat(result.stream().map(RideRequest::getGroupId).distinct()).hasSize(1);

        verify(messagingTemplate).convertAndSend(eq("/topic/match"), (Object) any());
    }
}
