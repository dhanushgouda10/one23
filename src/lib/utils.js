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
