// Button with the app's styles.
// variant: "lime" (main action) | "outline" | "ghost"    size: "sm" | "md" | "lg"
export function Button({
  variant = "outline",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} {...props} />
  );
}
