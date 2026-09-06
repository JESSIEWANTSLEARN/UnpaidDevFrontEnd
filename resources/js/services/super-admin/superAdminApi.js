const getCsrf = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

export async function apiRequest(url, { method = "GET", body = null, formData = false } = {}) {
  const headers = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRF-TOKEN"] = getCsrf();
  if (body && !formData) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    credentials: "same-origin",
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
  await fetch("/api/presence/offline", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "X-CSRF-TOKEN": getCsrf() },
  }).catch(() => null);

  const response = await fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json", "X-CSRF-TOKEN": getCsrf() },
  });
  if (!response.ok && response.status !== 302) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Logout failed.");
  }
}

export function download(url) {
  const link = document.createElement("a");
  link.href = url;
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
