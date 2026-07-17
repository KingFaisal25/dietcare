const DEFAULT_API_BASE_URL = "/api";

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function getBackendBaseUrl(): string {
  const apiUrl = getApiBaseUrl();

  if (apiUrl.startsWith("/")) {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }

  return apiUrl.replace(/\/api$/, "");
}

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();

  if (base.startsWith("/")) {
    const origin = typeof window !== "undefined" ? window.location.origin : getBackendBaseUrl();
    return `${origin}${base}${normalizedPath}`;
  }

  return `${base}${normalizedPath}`;
}

export function buildBackendUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
}
