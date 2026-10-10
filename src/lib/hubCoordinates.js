// Approximate map positions (latitude, longitude) for the Group Lobby map.
// They only place a pin on the map, so "close enough" is fine.
// A name that is missing here simply shows no pin (the map centres on Bengaluru).

const PLACES = {
  // Metro stations
  "Whitefield (Kadugodi)": { lat: 12.9958, lng: 77.7579 },
  "Kadugodi Tree Park": { lat: 12.9856, lng: 77.7469 },
  "Pattandur Agrahara": { lat: 12.9877, lng: 77.7381 },
  Kundalahalli: { lat: 12.9774, lng: 77.7159 },
  Hoodi: { lat: 12.9887, lng: 77.7114 },
  "Krishnarajapura (KR Puram)": { lat: 13.0003, lng: 77.6763 },
  Baiyappanahalli: { lat: 12.9907, lng: 77.6525 },
  Indiranagar: { lat: 12.9784, lng: 77.6386 },
  "MG Road": { lat: 12.9755, lng: 77.6068 },
  Majestic: { lat: 12.9757, lng: 77.5728 },
  Yeshwanthpur: { lat: 13.023, lng: 77.55 },
  Nagasandra: { lat: 13.048, lng: 77.5 },
  Jayanagar: { lat: 12.9296, lng: 77.58 },
  Banashankari: { lat: 12.9155, lng: 77.5737 },
  "BTM Layout": { lat: 12.9136, lng: 77.6103 },
  "Central Silk Board": { lat: 12.9177, lng: 77.6234 },
  Bommanahalli: { lat: 12.9, lng: 77.6335 },
  "Electronic City": { lat: 12.8486, lng: 77.659 },
  "Delta Electronics Bommasandra": { lat: 12.8155, lng: 77.6943 },

  // Offices / destinations
  ITPL: { lat: 12.986, lng: 77.737 },
  Brookefield: { lat: 12.9634, lng: 77.7157 },
  "Bagmane Tech Park": { lat: 12.9836, lng: 77.6961 },
  "Manyata Tech Park": { lat: 13.045, lng: 77.6206 },
  "Embassy Tech Village": { lat: 12.9258, lng: 77.6725 },
  EcoSpace: { lat: 12.926, lng: 77.672 },
  "Prestige Tech Park": { lat: 12.927, lng: 77.687 },
  "RMZ Infinity": { lat: 13.0189, lng: 77.644 },
  "Electronic City Phase 1": { lat: 12.8452, lng: 77.6602 },
  "Global Village Tech Park": { lat: 12.899, lng: 77.498 },
  "Outer Ring Road": { lat: 12.935, lng: 77.69 },
};

export const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

// Returns { lat, lng } for a place name, or null if we don't know it
export function coordinatesFor(name) {
  return PLACES[name] ?? null;
}
