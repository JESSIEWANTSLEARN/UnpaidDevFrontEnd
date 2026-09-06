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

export async function loadCsrfToken() {
    if (csrfToken) {
        return csrfToken;
    }

    const metaToken =
        typeof document !== "undefined"
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

export function getCachedCsrfToken() {
    return csrfToken;
}
