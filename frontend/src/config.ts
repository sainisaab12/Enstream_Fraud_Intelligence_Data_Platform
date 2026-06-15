export const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  const host = window.location.hostname;
  const port = window.location.port;

  if (host !== "localhost" && host !== "127.0.0.1") {
    if (host.includes(".loca.lt")) {
      return "";
    }
    if (host.includes(".onrender.com") && host.includes("-frontend")) {
      return "https://" + host.replace("-frontend", "-backend");
    }
  }

  if (port === "8000") {
    return "";
  }
  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
