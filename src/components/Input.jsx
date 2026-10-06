// Text input with the app's standard "input" style. Extra classes and props are passed through.
export function Input({ className = "", ...props }) {
  return <input className={`input ${className}`} {...props} />;
}
