const rawApiUrl =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const API_URL = rawApiUrl.replace(/\/+$/, "");

export function backendUrl(path = "") {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith("/")
        ? path
        : `/${path}`;

    return `${API_URL}${normalizedPath}`;
}

let csrfToken = "";
let csrfTokenRequest = null;

export function clearCachedCsrfToken() {
    csrfToken = "";
    csrfTokenRequest = null;
}

async function requestCsrfToken(allowMetaToken = true) {
    const metaToken =
        allowMetaToken && typeof document !== "undefined"
            ? document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute("content")
            : "";

    if (metaToken) {
        csrfToken = metaToken;
        return csrfToken;
    }

    const response = await fetch(
        backendUrl("/api/csrf-token"),
        {
            credentials: "include",
            headers: {
                Accept: "application/json",
            },
        },
    );

    if (!response.ok) {
        return "";
    }

    const data = await response.json();

    csrfToken = data.token ?? "";

    return csrfToken;
}

export async function loadCsrfToken({ forceRefresh = false } = {}) {
    if (forceRefresh) {
        clearCachedCsrfToken();
    }

    if (csrfToken) {
        return csrfToken;
    }

    if (csrfTokenRequest) {
        return csrfTokenRequest;
    }

    const pendingRequest = requestCsrfToken(!forceRefresh);
    csrfTokenRequest = pendingRequest;

    try {
        return await pendingRequest;
    } finally {
        if (csrfTokenRequest === pendingRequest) {
            csrfTokenRequest = null;
        }
    }
}

export async function csrfFetch(path, options = {}) {
    const method = String(options.method || "GET").toUpperCase();
    const requiresCsrf = method !== "GET" && method !== "HEAD";

    const send = async (forceRefresh = false) => {
        const headers = new Headers(options.headers || {});

        if (!headers.has("Accept")) {
            headers.set("Accept", "application/json");
        }

        if (requiresCsrf) {
            const token = await loadCsrfToken({ forceRefresh });

            if (token) {
                headers.set("X-CSRF-TOKEN", token);
            }
        }

        return fetch(backendUrl(path), {
            ...options,
            method,
            credentials: options.credentials ?? "include",
            headers,
        });
    };

    let response = await send(false);

    if (requiresCsrf && response.status === 419) {
        response = await send(true);
    }

    if (response.status === 419) {
        clearCachedCsrfToken();
    }

    return response;
}

export function getCachedCsrfToken() {
    return csrfToken;
}
