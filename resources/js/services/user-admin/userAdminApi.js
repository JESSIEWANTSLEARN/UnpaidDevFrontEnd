import { backendUrl, loadCsrfToken } from "../../config/api.js";
/* WBO_USER_ADMIN_API_V1 */

const messageFrom = (payload, fallback) => {
  const validation = Object.values(
    payload?.errors || {},
  )
    .flat()
    .find(Boolean);

  return (
    validation ||
    payload?.message ||
    fallback
  );
};

async function request(url, options = {}) {
  const method = options.method || "GET";

  const token =
    method !== "GET" && method !== "HEAD"
      ? await loadCsrfToken()
      : "";

  const response = await fetch(backendUrl(url), {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(method !== "GET"
        ? {
            "Content-Type":
              "application/json",
            "X-CSRF-TOKEN": token,
          }
        : {}),
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const payload = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      messageFrom(
        payload,
        "User administration request failed.",
      ),
    );

    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const loadUserAdminDashboard = (
  previewMode = false,
) =>
  request(
    `/api/user-admin/dashboard${
      previewMode ? "?preview=1" : ""
    }`,
  );

export const createManagedUser = (form) =>
  request("/api/user-admin/users", {
    method: "POST",
    body: form,
  });

export const updateManagedUser = (
  userId,
  form,
) =>
  request(
    `/api/user-admin/users/${userId}`,
    {
      method: "PUT",
      body: form,
    },
  );

export const loadManagedUserSessions = (
  userId,
  previewMode = false,
) =>
  request(
    `/api/user-admin/users/${userId}/sessions${
      previewMode ? "?preview=1" : ""
    }`,
  );

export const revokeManagedUserSession = (
  userId,
  sessionId,
) =>
  request(
    `/api/user-admin/users/${userId}/sessions/${encodeURIComponent(
      sessionId,
    )}`,
    {
      method: "DELETE",
    },
  );

export const revokeAllManagedUserSessions = (
  userId,
) =>
  request(
    `/api/user-admin/users/${userId}/sessions`,
    {
      method: "DELETE",
    },
  );