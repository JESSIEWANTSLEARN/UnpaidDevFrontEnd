const DEFAULT_TIMEOUT_MS = 15000;
function jsonResponse(status, message, extra = {}) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      ...extra,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
function isOtpSendingEndpoint(url) {
  const value = String(url);
  return (
    value === "/login" ||
    value === "/register" ||
    value === "/login/resend-otp" ||
    value === "/signup/resend-otp"
  );
}
export async function authFetch(
  url,
  options = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timer = window.setTimeout(
    () => controller.abort(),
    timeoutMs,
  );
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    // Laravel normally uses 419 for CSRF/session expiration.
    if (response.status === 419) {
      return jsonResponse(
        419,
        "Your session expired. Please refresh the page and try again.",
      );
    }
    // Do not expose generic framework/server error text to normal users.
    if (response.status >= 500) {
      if (isOtpSendingEndpoint(url)) {
        return jsonResponse(
          response.status,
          "We couldn't send the verification code. Please try again shortly.",
        );
      }
      return jsonResponse(
        response.status,
        "Something went wrong. Please try again later.",
      );
    }
    return response;
  } catch (error) {
    if (error?.name === "AbortError") {
      return jsonResponse(
        408,
        "The connection is taking too long. Please try again.",
      );
    }
    if (
      typeof navigator !== "undefined" &&
      navigator.onLine === false
    ) {
      return jsonResponse(
        503,
        "Unable to connect. Check your internet connection.",
      );
    }
    return jsonResponse(
      503,
      "Unable to connect to the server. Please try again.",
    );
  } finally {
    window.clearTimeout(timer);
  }
}