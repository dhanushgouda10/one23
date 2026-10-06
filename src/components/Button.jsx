export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  ...props
}) {
  const sizeClass = size === "default" ? "btn-default-size" : `btn-${size}`;
  return (
    <button type={type} className={`btn btn-${variant} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
