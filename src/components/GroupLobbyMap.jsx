import { useEffect, useRef, useState } from "react";
import { coordinatesFor, BENGALURU_CENTER } from "../lib/hubCoordinates";
import { initialsOf, escapeHtml } from "../lib/utils";

const RIDER_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#0891b2"];

function colorForRider(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return RIDER_COLORS[hash % RIDER_COLORS.length] ?? "#2563eb";
}

function pinHtml(color, label) {
  return `<div style="background:${color};display:grid;place-items:center;height:32px;width:32px;border-radius:9999px;border:2px solid white;font-size:10px;font-weight:700;color:white;box-shadow:0 4px 6px rgba(0,0,0,.12)">${escapeHtml(label)}</div>`;
}

export function GroupLobbyMap({ pickupHub, destination, memberLocations, selfName }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletModRef = useRef(null);
  const riderMarkersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  const pickupCoords = coordinatesFor(pickupHub);
  const destCoords = coordinatesFor(destination);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (cancelled || !containerRef.current) return;
        leafletModRef.current = L;

        const center = pickupCoords ?? destCoords ?? BENGALURU_CENTER;
        const map = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom: 12,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const pinIcon = (color, label) =>
          L.divIcon({
            className: "",
            html: pinHtml(color, label),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

        const bounds = [];

        if (pickupCoords) {
          L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pinIcon("#16a34a", "P") })
            .addTo(map)
            .bindTooltip(`Pickup — ${escapeHtml(pickupHub)}`);
          bounds.push([pickupCoords.lat, pickupCoords.lng]);
        }
        if (destCoords) {
          L.marker([destCoords.lat, destCoords.lng], { icon: pinIcon("#dc2626", "D") })
            .addTo(map)
            .bindTooltip(`Destination — ${escapeHtml(destination)}`);
          bounds.push([destCoords.lat, destCoords.lng]);
        }
        if (pickupCoords && destCoords) {
          L.polyline(
            [
              [pickupCoords.lat, pickupCoords.lng],
              [destCoords.lat, destCoords.lng],
            ],
            { color: "#0f172a", weight: 3, dashArray: "2 10", lineCap: "round" },
          ).addTo(map);
        }
        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [48, 48] });
        }

        mapRef.current = map;
        setMapReady(true);
      } catch {
        if (!cancelled) setMapError("Could not load the map.");
      }
    }

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletModRef.current = null;
      riderMarkersRef.current = {};
      setMapReady(false);
    };
  }, [pickupHub, destination]);

  useEffect(() => {
    const L = leafletModRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    for (const [name, loc] of Object.entries(memberLocations)) {
      const isSelf = name === selfName;
      const existing = riderMarkersRef.current[name];
      if (existing) {
        existing.setLatLng([loc.latitude, loc.longitude]);
        continue;
      }
      const icon = L.divIcon({
        className: "",
        html: pinHtml(isSelf ? "#111827" : colorForRider(name), initialsOf(name)),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      riderMarkersRef.current[name] = L.marker([loc.latitude, loc.longitude], { icon })
        .addTo(map)
        .bindTooltip(isSelf ? "You" : escapeHtml(name));
    }
  }, [mapReady, memberLocations, selfName]);

  return (
    <div
      role="region"
      aria-label={`Route map: ${pickupHub} to ${destination}, with live rider locations`}
      className="map-wrap"
    >
      {mapError ? (
        <div className="map-error">
          <p className="field-error" style={{ fontWeight: 600 }}>
            {mapError}
          </p>
          <p className="hint">You can still use chat and location sharing without the map.</p>
        </div>
      ) : (
        <>
          {!mapReady ? (
            <div className="map-loading animate-pulse">
              <p className="hint">Loading map…</p>
            </div>
          ) : null}
          <div ref={containerRef} className="map-fill" />
        </>
      )}
    </div>
  );
}
