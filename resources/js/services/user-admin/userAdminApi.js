import { csrfFetch } from "../../config/api.js";
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

  const response = await csrfFetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(method !== "GET" && method !== "HEAD"
        ? {
            "Content-Type":
              "application/json",
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
    const fallback =
      response.status === 419
        ? "Your session expired. Please sign in again."
        : "User administration request failed.";

    const error = new Error(
      messageFrom(
        payload,
        fallback,
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
