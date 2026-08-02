import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import { getChatHistory, getGroupDetails, startRide, endRide, cancelGroup } from "../services/api";
import { createChatClient, sendChatMessage } from "../websocket/chatClient";
import { createLocationClient, sendLocationUpdate } from "../websocket/locationClient";
import { createGroupClient } from "../websocket/groupClient";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/chat.css";

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

const STATUS_LABEL = {
  MATCHED: "Ride Matched",
  IN_PROGRESS: "Ride In Progress",
  COMPLETED: "Ride Completed"
};

// Leaflet markers are plain HTML strings, not real DOM/CSS-styled
// elements, so they can't pick up `var(--accent)` etc. the way the rest
// of the UI does. Reading the custom properties off the root at the
// moment a marker is drawn means the map always matches the current
// theme instead of a color hardcoded back when the palette was lime on
// near-black.
function themeColor(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function GroupLobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(location.state?.message || "");
  const [sidePanelTab, setSidePanelTab] = useState("chat");

  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState("");

  const chatClientRef = useRef(null);
  const locationClientRef = useRef(null);
  const groupClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const locationIntervalRef = useRef(null);

  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [memberLocations, setMemberLocations] = useState({});
  const [rideStatus, setRideStatus] = useState("MATCHED");
  const [startingRide, setStartingRide] = useState(false);
  const [endingRide, setEndingRide] = useState(false);
  const [cancellingGroup, setCancellingGroup] = useState(false);

  // sessionStorage is per-tab and is the only place Login.jsx ever writes
  // to, so reading from it alone (no localStorage fallback) is what keeps
  // two tabs logged in as two different accounts from mixing up.
  const userName = sessionStorage.getItem("userName") || "You";

  // Load group details when page opens
  useEffect(() => {
    if (!groupId) {
      navigate("/my-rides", { replace: true });
      return;
    }

    const loadGroup = async () => {
      try {
        const data = await getGroupDetails(groupId);
        setGroupData(data);
        setRideStatus(data.status || "MATCHED");
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load group details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGroup();
  }, [groupId, navigate]);

  // Load chat history and connect to WebSocket
  useEffect(() => {
    if (!groupId || loading) {
      return;
    }

    const loadHistory = async () => {
      try {
        const messages = await getChatHistory(groupId);
        setChatMessages(messages);
        setChatError("");
      } catch (err) {
        setChatError(
          err.response?.data?.message ||
          "Could not load chat history."
        );
      }
    };

    loadHistory();

    const client = createChatClient({
      groupId,
      onConnect: () => {
        setChatError("");
      },
      onMessage: (message) => {
        // Avoid duplicate messages when same message arrives twice
        setChatMessages((prev) => {
          const alreadyExists = prev.some((item) => item.id === message.id);
          if (alreadyExists) {
            return prev;
          }
          return [...prev, message];
        });
      },
      onError: (errorMsg) => {
        setChatError(errorMsg);
      }
    });

    chatClientRef.current = client;
    client.activate();

    return () => {
      if (chatClientRef.current) {
        chatClientRef.current.deactivate();
        chatClientRef.current = null;
      }
    };
  }, [groupId, loading]);

  // Listen for the group being dissolved (another member left before the
  // ride started). When that happens this group no longer exists, so send
  // everyone still here back to My Rides — from there they'll be
  // auto-matched into a new group lobby once a replacement rider joins.
  useEffect(() => {
    if (!groupId || loading) {
      return;
    }

    const client = createGroupClient({
      groupId,
      onGroupEvent: (event) => {
        if (event?.type === "DISSOLVED") {
          navigate("/my-rides", {
            replace: true,
            state: { message: event.message || "Your group was dissolved. You're back in the waiting queue." }
          });
        }
      }
    });

    groupClientRef.current = client;
    client.activate();

    return () => {
      if (groupClientRef.current) {
        groupClientRef.current.deactivate();
        groupClientRef.current = null;
      }
    };
  }, [groupId, loading, navigate]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || !groupData) {
      return;
    }

    // Create map instance
    const map = L.map(mapRef.current).setView([12.9716, 77.5946], 13); // Default to Bangalore

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add destination marker (using a fixed location for demo - in production you'd geocode the destination)
    const destinationIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${themeColor("--success", "#35d07f")}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Add a dummy destination marker near the center (in production, geocode the actual destination)
    const destMarker = L.marker([12.9716, 77.5946], { icon: destinationIcon })
      .addTo(map)
      .bindPopup(`<b>Destination</b><br>${groupData.destination || "Your destination"}`);

    markersRef.current["destination"] = destMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, [groupData]);

  // Connect to location WebSocket
  useEffect(() => {
    if (!groupId || loading) {
      return;
    }

    const client = createLocationClient({
      groupId,
      onConnect: () => {
        setLocationError("");
      },
      onLocationUpdate: (locationData) => {
        // Update member locations
        setMemberLocations((prev) => ({
          ...prev,
          [locationData.userName]: {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          }
        }));

        // Update marker on map
        updateMarker(locationData.userName, locationData.latitude, locationData.longitude);
      },
      onError: (errorMsg) => {
        setLocationError(errorMsg);
      }
    });

    locationClientRef.current = client;
    client.activate();

    return () => {
      if (locationClientRef.current) {
        locationClientRef.current.deactivate();
        locationClientRef.current = null;
      }
      // Stop location sharing when component unmounts
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [groupId, loading]);

  // Update marker on map
  const updateMarker = (memberName, latitude, longitude) => {
    if (!mapInstanceRef.current) {
      return;
    }

    const map = mapInstanceRef.current;

    // Remove existing marker if it exists
    if (markersRef.current[memberName]) {
      map.removeLayer(markersRef.current[memberName]);
    }

    // Create custom icon based on user
    const isCurrentUser = memberName === userName;
    const iconColor = isCurrentUser
      ? themeColor("--accent", "#a4f52a")
      : themeColor("--violet", "#6b9e3d");

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Add new marker
    const marker = L.marker([latitude, longitude], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${memberName}</b><br>${isCurrentUser ? "You" : "Group member"}`);

    markersRef.current[memberName] = marker;
  };

  // Handle location sharing
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    // Check if location client is connected
    if (!locationClientRef.current || !locationClientRef.current.connected) {
      setLocationError("Location connection not ready. Please wait a moment and try again.");
      return;
    }

    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSharingLocation(true);

        // Send initial location
        const { latitude, longitude } = position.coords;
        const sent = sendLocationUpdate(locationClientRef.current, groupId, latitude, longitude);

        if (!sent) {
          setLocationError("Failed to send location. Connection may be lost.");
          setSharingLocation(false);
          return;
        }

        // Update own marker
        updateMarker(userName, latitude, longitude);

        // Fit map to show all markers
        if (mapInstanceRef.current && Object.keys(markersRef.current).length > 0) {
          const group = L.featureGroup(Object.values(markersRef.current));
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }

        // Send location every 3 seconds
        locationIntervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const updateSent = sendLocationUpdate(
                locationClientRef.current,
                groupId,
                pos.coords.latitude,
                pos.coords.longitude
              );
              if (updateSent) {
                updateMarker(userName, pos.coords.latitude, pos.coords.longitude);
              }
            },
            (err) => {
              console.error("Error getting location:", err);
            }
          );
        }, 3000);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to retrieve your location. Please enable location permissions.");
        setSharingLocation(false);
      }
    );
  };

  // Handle start ride
  const handleStartRide = async () => {
    setStartingRide(true);
    try {
      await startRide(groupId);
      setRideStatus("IN_PROGRESS");
      // Reload group data to get updated status
      const data = await getGroupDetails(groupId);
      setGroupData(data);
      setRideStatus(data.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start ride");
    } finally {
      setStartingRide(false);
    }
  };

  // Handle end ride
  const handleEndRide = async () => {
    setEndingRide(true);
    try {
      await endRide(groupId);
      setRideStatus("COMPLETED");
      // Stop location sharing
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      setSharingLocation(false);
      // Reload group data to get updated status
      const data = await getGroupDetails(groupId);
      setGroupData(data);
      setRideStatus(data.status);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end ride");
    } finally {
      setEndingRide(false);
    }
  };

  // Handle cancel group — lets a member back out while still MATCHED,
  // without waiting for any timer. Cancels the whole group since the
  // ride needs all 3 riders.
  const handleCancelGroup = async () => {
    if (!window.confirm("Cancel this ride for your whole group? This can't be undone.")) {
      return;
    }

    setCancellingGroup(true);
    try {
      await cancelGroup(groupId);
      navigate("/my-rides", {
        replace: true,
        state: { message: "Group ride was cancelled." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel group.");
    } finally {
      setCancellingGroup(false);
    }
  };

  // Check if all members have shared location
  const allMembersSharingLocation = () => {
    if (!groupData?.members) {
      return false;
    }
    return groupData.members.every(
      (member) => memberLocations[member.fullName]
    );
  };

  // Count members online (sharing location)
  const membersOnlineCount = Object.keys(memberLocations).length;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    const sent = sendChatMessage(
      chatClientRef.current,
      groupId,
      messageInput
    );

    if (!sent) {
      setChatError("Chat connection lost. Please refresh the page.");
      return;
    }

    setMessageInput("");
    setSendingMessage(false);
  };

  if (loading) {
    return (
      <AppShell title="Group Lobby" onBack={() => navigate("/my-rides")} backLabel="Back to My Rides">
        <div className="app-content animate-in">
          <div className="loading">
            <span className="btn-spinner btn-spinner--muted" />
            Loading group lobby...
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Group Lobby" onBack={() => navigate("/my-rides")} backLabel="Back to My Rides">
      {toastMessage && (
        <div className="toast-overlay" role="alert" aria-live="polite">
          <div className="toast-card">
            <div className="toast-icon">
              <Icon name="check" size={15} strokeWidth={2.4} />
            </div>
            <div>
              <h3>Ride Matched</h3>
              <p>{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="app-content animate-in">
        {error ? (
          <div className="error-message--dark">{error}</div>
        ) : (
          <>
            <div className="page-header-row">
              <div>
                <span className="pill-tag pill-tag--dark page-eyebrow">Group Lobby</span>
                <h1 className="page-title">{STATUS_LABEL[rideStatus] || "Ride Matched"}</h1>
                <p className="page-lede">
                  {groupData?.pickupHub} → {groupData?.destination} · Group {groupData?.groupId}
                </p>
              </div>
            </div>

            {locationError && <div className="error-message--dark">{locationError}</div>}

            <div className="lobby-layout">
              {/* Map panel */}
              <div className="lobby-map-panel">
                <div ref={mapRef} className="leaflet-map-el" />

                <div className="lobby-map-panel__topbar">
                  <span className="lobby-status-pill">
                    <Icon name={rideStatus === "IN_PROGRESS" ? "car" : rideStatus === "COMPLETED" ? "check" : "map"} size={14} strokeWidth={2.2} />
                    {STATUS_LABEL[rideStatus] || "Ride Matched"}
                  </span>
                  <span className="lobby-status-pill">
                    <Icon name="users" size={14} strokeWidth={2.2} />
                    {membersOnlineCount} / {groupData?.members?.length || 0} online
                  </span>
                </div>

                <div className="lobby-map-panel__bottom">
                  <div className="lobby-member-dock">
                    <div className="lobby-member-dock__avatars">
                      {groupData?.members?.map((member, i) => (
                        <span
                          key={`${member.fullName}-${i}`}
                          className={`lobby-member-dock__avatar ${memberLocations[member.fullName] ? "lobby-member-dock__avatar--online" : ""}`}
                          title={member.fullName}
                        >
                          {getInitials(member.fullName)}
                        </span>
                      ))}
                    </div>
                    <div className="lobby-member-dock__meta">
                      <strong>Your group</strong>
                      <span>
                        {sharingLocation ? "Sharing your location every 3s" : "Location not shared yet"}
                      </span>
                    </div>
                    {!sharingLocation && rideStatus !== "COMPLETED" && (
                      <button onClick={handleShareLocation} className="btn-secondary btn-secondary--sm">
                        <Icon name="pin" size={14} strokeWidth={2.2} />
                        Share
                      </button>
                    )}
                  </div>

                  {rideStatus === "MATCHED" && (
                    <div className="lobby-actions-row">
                      {allMembersSharingLocation() && (
                        <button
                          onClick={handleStartRide}
                          disabled={startingRide || cancellingGroup}
                          className="btn-primary"
                        >
                          {startingRide ? "Starting..." : (
                            <>
                              <Icon name="bolt" size={16} strokeWidth={2.2} />
                              Start Ride
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={handleCancelGroup}
                        disabled={cancellingGroup || startingRide}
                        className="btn-cancel btn-cancel--on-dark"
                      >
                        {cancellingGroup ? "Cancelling..." : (
                          <>
                            <Icon name="close" size={15} strokeWidth={2.2} />
                            Cancel Ride
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {rideStatus === "IN_PROGRESS" && (
                    <div className="lobby-actions-row">
                      <button onClick={handleEndRide} disabled={endingRide} className="btn-primary">
                        {endingRide ? "Ending..." : (
                          <>
                            <Icon name="check" size={16} strokeWidth={2.2} />
                            End Ride
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Side panel — trip summary, roster, chat */}
              <div className="lobby-side-panel">
                <div className="lobby-trip-summary">
                  <div>
                    <span className="label">Group ID</span>
                    <p className="mono-text">{groupData?.groupId || "—"}</p>
                  </div>
                  <div>
                    <span className="label">Status</span>
                    <span className={`status-badge status-${rideStatus?.toLowerCase() || "matched"}`}>
                      {rideStatus || "MATCHED"}
                    </span>
                  </div>
                  <div>
                    <span className="label">Pickup Hub</span>
                    <p>{groupData?.pickupHub || "—"}</p>
                  </div>
                  <div>
                    <span className="label">Destination</span>
                    <p>{groupData?.destination || "—"}</p>
                  </div>
                </div>

                <div className="lobby-side-tabs">
                  <button
                    className={`lobby-side-tab ${sidePanelTab === "chat" ? "active" : ""}`}
                    onClick={() => setSidePanelTab("chat")}
                  >
                    Chat
                  </button>
                  <button
                    className={`lobby-side-tab ${sidePanelTab === "members" ? "active" : ""}`}
                    onClick={() => setSidePanelTab("members")}
                  >
                    Members ({groupData?.members?.length || 0})
                  </button>
                </div>

                {sidePanelTab === "members" ? (
                  <div className="roster-list">
                    {groupData?.members?.map((member, index) => (
                      <div key={`${member.fullName}-${index}`} className="roster-row">
                        <span className="roster-row__avatar">{getInitials(member.fullName)}</span>
                        <div className="roster-row__info">
                          <strong>{member.fullName}</strong>
                          <span>
                            {memberLocations[member.fullName] ? (
                              <>
                                <Icon name="pin" size={11} strokeWidth={2.4} />
                                Online
                              </>
                            ) : (
                              member.rideStatus
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chat-panel">
                    {chatError && <div className="error-message" style={{ margin: "12px 16px 0" }}>{chatError}</div>}

                    <div className="chat-messages">
                      {chatMessages.length === 0 ? (
                        <div className="chat-empty">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => (
                          <div
                            key={msg.id || `${msg.senderName}-${msg.timestamp}`}
                            className={`chat-message ${msg.senderName === userName ? "own-message" : "other-message"}`}
                          >
                            <div className="message-sender">
                              <strong>{msg.senderName}</strong>
                              <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-text">{msg.message}</div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input-form">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        disabled={sendingMessage}
                        className="chat-input"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !messageInput.trim()}
                        className="btn-send-message"
                        aria-label="Send message"
                      >
                        <Icon name="send" size={16} strokeWidth={2.2} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default GroupLobby;
