// Lists shown on the Join page.
// PICKUP = Namma Metro stations (Purple, Green and Yellow lines) close to office areas.
// DESTINATIONS = offices / tech parks people travel to from those stations.
// To add a station or office: add the name here AND its map position in hubCoordinates.js.

export const METRO_STATIONS = [
  "Whitefield (Kadugodi)",
  "Kadugodi Tree Park",
  "Pattandur Agrahara",
  "Kundalahalli",
  "Hoodi",
  "Krishnarajapura (KR Puram)",
  "Baiyappanahalli",
  "Indiranagar",
  "MG Road",
  "Majestic",
  "Yeshwanthpur",
  "Nagasandra",
  "Jayanagar",
  "Banashankari",
  "BTM Layout",
  "Central Silk Board",
  "Bommanahalli",
  "Electronic City",
  "Delta Electronics Bommasandra",
];

export const DESTINATIONS = [
  "ITPL",
  "Brookefield",
  "Bagmane Tech Park",
  "Manyata Tech Park",
  "Embassy Tech Village",
  "EcoSpace",
  "Prestige Tech Park",
  "RMZ Infinity",
  "Electronic City Phase 1",
  "Global Village Tech Park",
  "Outer Ring Road",
  "MG Road",
];

// The AI answers with free text (e.g. "Kadugodi"), but the Join page only accepts
// names from the lists above (e.g. "Whitefield (Kadugodi)").
// This finds the list item that matches the text, or returns "" if nothing matches.
export function findLocation(text, list) {
  const wanted = (text || "").trim().toLowerCase();
  if (!wanted) return "";

  // 1. exact match, ignoring upper/lower case
  const exact = list.find((name) => name.toLowerCase() === wanted);
  if (exact) return exact;

  // 2. one name contains the other ("Kadugodi" is inside "Whitefield (Kadugodi)")
  const partial = list.find((name) => {
    const lower = name.toLowerCase();
    return lower.includes(wanted) || wanted.includes(lower);
  });
  return partial || "";
}
