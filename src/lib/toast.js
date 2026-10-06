let listeners = [];

export function subscribeToasts(listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

function showToast(message, type = "info") {
  const toast = { id: Date.now() + Math.random(), message, type };
  listeners.forEach((listener) => listener(toast));
}

export const toast = {
  success: (message) => showToast(message, "success"),
  message: (message) => showToast(message, "info"),
};
