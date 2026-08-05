import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { coordinatesFor, BENGALURU_CENTER } from "@/lib/hubCoordinates";
import type { LocationUpdate } from "@/lib/websocket";

/**
 * Group Lobby live map.
 *
 * Leaflet touches `window`/`document` the moment its module is evaluated,
 * which is exactly the class of bug that broke sockjs-client under SSR
 * ("ReferenceError: global is not defined" — see vite.config.ts). Rather
 * than lean on a bundler-level `define` workaround again, this component
 * sidesteps the problem at the source: `leaflet` is only ever reached via
 * a dynamic `import()` inside a `useEffect`, so its module code never runs
 * during SSR or at initial script-evaluation time — only after this
 * component has actually mounted in a real browser.
 *
 * Pickup/destination pins come from the static, frontend-only
 * hubCoordinates.ts lookup (no backend data for this — see that file's
 * comment). Rider markers come from real data: the memberLocations prop is
 * fed by the /topic/location/{groupId} WebSocket subscription already
 * wired up in rides.$groupId.tsx.
 */

type Props = {
  pickupHub: string;
  destination: string;
  memberLocations: Record<string, LocationUpdate>;
  selfName: string;
};

const RIDER_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#0891b2"];

function colorForRider(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return RIDER_COLORS[hash % RIDER_COLORS.length] ?? "#2563eb";
}

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function GroupLobbyMap({ pickupHub, destination, memberLocations, selfName }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletModRef = useRef<typeof import("leaflet") | null>(null);
  const riderMarkersRef = useRef<Record<string, LeafletMarker>>({});
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  const pickupCoords = coordinatesFor(pickupHub);
  const destCoords = coordinatesFor(destination);

  // Initialize the map once. Only depends on the container existing —
  // pickup/destination pins and the connecting line are drawn once here
  // since a group's route never changes after it's matched.
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

        const pinIcon = (color: string, label: string) =>
          L.divIcon({
            className: "",
            html: `<div style="background:${color}" class="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md">${label}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

        const bounds: [number, number][] = [];

        if (pickupCoords) {
          L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pinIcon("#16a34a", "P") })
            .addTo(map)
            .bindTooltip(`Pickup — ${pickupHub}`);
          bounds.push([pickupCoords.lat, pickupCoords.lng]);
        }
        if (destCoords) {
          L.marker([destCoords.lat, destCoords.lng], { icon: pinIcon("#dc2626", "D") })
            .addTo(map)
            .bindTooltip(`Destination — ${destination}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupHub, destination]);

  // Keep rider markers in sync with live location updates. Runs whenever
  // the map is ready or a new location update comes in over the socket.
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
        html: `<div style="background:${isSelf ? "#111827" : colorForRider(name)}" class="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md">${initialsOf(name)}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      riderMarkersRef.current[name] = L.marker([loc.latitude, loc.longitude], { icon })
        .addTo(map)
        .bindTooltip(isSelf ? "You" : name);
    }
  }, [mapReady, memberLocations, selfName]);

  return (
    <div
      role="region"
      aria-label={`Route map: ${pickupHub} to ${destination}, with live rider locations`}
      className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-border bg-muted/40 sm:h-[420px] lg:h-[520px]"
    >
      {mapError ? (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
          <p className="text-sm font-semibold text-destructive">{mapError}</p>
          <p className="text-xs text-muted-foreground">
            You can still use chat and location sharing without the map.
          </p>
        </div>
      ) : (
        <>
          {!mapReady ? (
            <div className="absolute inset-0 z-10 flex animate-pulse items-center justify-center bg-muted/60">
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          ) : null}
          <div ref={containerRef} className="h-full w-full" />
        </>
      )}
    </div>
  );
}
