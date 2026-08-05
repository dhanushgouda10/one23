/**
 * Static lat/lng lookup for the fixed Bengaluru hub/destination names in
 * lib/locations.ts (PICKUP_HUBS / DESTINATIONS).
 *
 * This is a frontend-only presentation concern, not a backend feature: the
 * backend stores pickupHub/destination as free-text strings (see
 * RideRequest.pickupHub / .destination) and has no notion of coordinates.
 * Nothing here changes what's sent to or returned by the API — it only
 * lets the Group Lobby map place a pin for an already-known place name.
 *
 * Coordinates are the approximate locality center for each named area
 * (typically its main junction or a well-known landmark within it), not a
 * specific building address — accurate enough to place a meaningful pin on
 * a city-scale map, not meant for turn-by-turn navigation.
 */
export type LatLng = { lat: number; lng: number };

export const HUB_COORDINATES: Record<string, LatLng> = {
  // Pickup hubs
  Whitefield: { lat: 12.9698, lng: 77.75 },
  Marathahalli: { lat: 12.9569, lng: 77.7011 },
  "Electronic City": { lat: 12.8452, lng: 77.6602 },
  Bellandur: { lat: 12.9257, lng: 77.6649 },
  "HSR Layout": { lat: 12.9116, lng: 77.6412 },
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  Indiranagar: { lat: 12.9719, lng: 77.6412 },
  Hebbal: { lat: 13.0358, lng: 77.597 },
  Yelahanka: { lat: 13.1005, lng: 77.5963 },
  Jayanagar: { lat: 12.925, lng: 77.5938 },
  Banashankari: { lat: 12.925, lng: 77.556 },
  "BTM Layout": { lat: 12.9166, lng: 77.6101 },
  "KR Puram": { lat: 13.006, lng: 77.697 },
  Kadugodi: { lat: 12.993, lng: 77.766 },
  "Sarjapur Road": { lat: 12.901, lng: 77.687 },
  "Silk Board": { lat: 12.9172, lng: 77.6228 },
  Majestic: { lat: 12.9767, lng: 77.5713 },

  // Destinations (tech parks / office corridors)
  "Manyata Tech Park": { lat: 13.045, lng: 77.6206 },
  "Bagmane Tech Park": { lat: 12.9836, lng: 77.6961 },
  "Embassy Tech Village": { lat: 12.9258, lng: 77.6725 },
  ITPL: { lat: 12.986, lng: 77.737 },
  Brookefield: { lat: 12.9634, lng: 77.7157 },
  EcoSpace: { lat: 12.926, lng: 77.672 },
  "Prestige Tech Park": { lat: 12.927, lng: 77.687 },
  "RMZ Infinity": { lat: 13.0189, lng: 77.644 },
  "Global Village Tech Park": { lat: 12.899, lng: 77.498 },
  "Outer Ring Road": { lat: 12.935, lng: 77.69 },
  "MG Road": { lat: 12.9758, lng: 77.6045 },
};

/** Bengaluru city-center fallback for when a hub name has no known coordinates. */
export const BENGALURU_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 };

export function coordinatesFor(name: string | undefined | null): LatLng | null {
  if (!name) return null;
  return HUB_COORDINATES[name] ?? null;
}
