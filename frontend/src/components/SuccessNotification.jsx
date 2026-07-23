function SuccessNotification({ message, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className="toast-overlay" role="alert">
      <div className="toast-card toast-success">
        <div className="toast-icon">✓</div>
        <div>
          <h3>Ride Request Created!</h3>
          <p>{message}</p>
        </div>
        <button type="button" className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}

export default SuccessNotification;
