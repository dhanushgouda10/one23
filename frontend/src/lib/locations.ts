/**
 * Bengaluru pickup hubs and office destinations offered in the join-ride
 * form. one23 only serves office commuters travelling within Bengaluru —
 * these are real residential/transit hubs and tech corridors, not a
 * public "any city" list. The backend accepts pickupHub/destination as
 * free text, but constraining the form to this list keeps riders on the
 * same route matchable against each other.
 */
export const PICKUP_HUBS = [
  "Whitefield",
  "Marathahalli",
  "Electronic City",
  "Bellandur",
  "HSR Layout",
  "Koramangala",
  "Indiranagar",
  "Hebbal",
  "Yelahanka",
  "Jayanagar",
  "Banashankari",
  "BTM Layout",
  "KR Puram",
  "Kadugodi",
  "Sarjapur Road",
  "Silk Board",
  "Majestic",
] as const;

export const DESTINATIONS = [
  "Manyata Tech Park",
  "Bagmane Tech Park",
  "Embassy Tech Village",
  "ITPL",
  "Brookefield",
  "EcoSpace",
  "Prestige Tech Park",
  "RMZ Infinity",
  "Global Village Tech Park",
  "Outer Ring Road",
  "MG Road",
] as const;
