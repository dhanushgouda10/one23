// Small helpers shared by several components.

// "Priya Nair" -> "PN". Uses `fallback` when the name is empty.
export function initialsOf(name, fallback = "?") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || fallback
  );
}

// Escapes text so it can be safely placed inside an HTML string
// (e.g. Leaflet tooltips and marker icons, which render strings as HTML).
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
