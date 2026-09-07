import { backendUrl, loadCsrfToken } from "../../config/api.js";
export async function apiRequest(url, { method = "GET", body = null, formData = false } = {}) {
  const headers = { Accept: "application/json" };
  if (method !== "GET" && method !== "HEAD") {
    const token = await loadCsrfToken();
    if (token) headers["X-CSRF-TOKEN"] = token;
  }
  if (body && !formData) headers["Content-Type"] = "application/json";

  const response = await fetch(backendUrl(url), {
    method,
    credentials: "include",
    headers,
    body: body ? (formData ? body : JSON.stringify(body)) : undefined,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = result.errors ? Object.values(result.errors).flat().find(Boolean) : null;
    const error = new Error(validationMessage || result.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
}

export async function logoutRequest() {
  window.dispatchEvent(
    new Event("wbo:logout-started"),
  );
  const token = await loadCsrfToken();
  await fetch(backendUrl("/api/presence/offline"), {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "X-CSRF-TOKEN": token },
  }).catch(() => null);

  const response = await fetch(backendUrl("/logout"), {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json", "X-CSRF-TOKEN": token },
  });
  if (!response.ok && response.status !== 302) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Logout failed.");
  }
}

export function download(url) {
  const link = document.createElement("a");
  link.href = backendUrl(url);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function toFormData(values, booleanFields = []) {
  const body = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value instanceof File) return body.append(key, value);
    if (value === null || value === "") return;
    body.append(key, booleanFields.includes(key) ? (value ? "1" : "0") : value);
  });
  return body;
}
