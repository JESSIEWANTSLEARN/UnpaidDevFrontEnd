import {
    backendUrl,
    csrfFetch,
    getCachedCsrfToken,
} from "../../../config/api.js";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../../../css/shared/session-security.css";

const PUBLIC_PATHS = new Set([
    "/",
    "/faq",
    "/forgot-password",
    "/login",
    "/signup",
    "/signup-verify",
    "/login-otp",
]);

const LOGOUT_START_EVENT = "wbo:logout-started";

const HUMAN_ACTIVITY_EVENTS = [
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
];

async function request(url, options = {}) {
    const headers = {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
    };

    const response = await csrfFetch(url, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 419) {
        window.location.href = "/login";
    }

    return {
        response,
        data,
    };
}

export default function PresenceTracker() {
    const location = useLocation();

    const isPublicPage = PUBLIC_PATHS.has(location.pathname);

    const [policy, setPolicy] = useState(null);
    const [clock, setClock] = useState(Date.now());
    const [endingSession, setEndingSession] = useState(false);

    const lastHumanActivity = useRef(Date.now());
    const lastServerSync = useRef(0);
    const logoutStarted = useRef(false);
    const policyReady = useRef(false);
    const activityInFlight = useRef(false);
    const heartbeatInFlight = useRef(false);

    useEffect(() => {
        if (isPublicPage) {
            setPolicy(null);
            logoutStarted.current = false;
            policyReady.current = false;
            return undefined;
        }

        policyReady.current = false;

        let disposed = false;

        const stopForLogout = () => {
            logoutStarted.current = true;
        };

        window.addEventListener(
            LOGOUT_START_EVENT,
            stopForLogout,
        );

        const redirectToLogin = () => {
            if (disposed) return;

            window.location.href = "/login";
        };

        const sendActivity = async (force = false) => {
            if (
                disposed ||
                logoutStarted.current ||
                !policyReady.current
            ) {
                return false;
            }

            const now = Date.now();

            if (
                activityInFlight.current ||
                (!force &&
                    now -
                        lastServerSync.current <
                        30_000)
            ) {
                return true;
            }

            lastServerSync.current = now;
            activityInFlight.current = true;

            try {
                const { response } = await request(
                    "/api/session/activity",
                    {
                        method: "POST",
                        body: JSON.stringify({}),
                    },
                );

                if (response.status === 401) {
                    redirectToLogin();
                    return false;
                }

                return response.ok;
            } finally {
                activityInFlight.current = false;
            }
        };

        const markHumanActivity = () => {
            if (logoutStarted.current) return;

            lastHumanActivity.current = Date.now();

            // Local activity is immediate. The server sync starts only
            // after the session policy is loaded and is throttled.
            if (policyReady.current) {
                void sendActivity(false);
            }
        };

        const loadPolicy = async () => {
            const { response, data } = await request("/api/session/status");

            if (disposed) return;

            // The status endpoint returns HTTP 200 for a normal guest session.
            // On protected pages, authenticated=false still means go to login.
            if (
                response.status === 401 ||
                (response.ok && !data.authenticated)
            ) {
                redirectToLogin();
                return;
            }

            if (!response.ok) {
                return;
            }

            const idleSeconds = Number(data.idle_seconds);

            const warningSeconds = Number(data.warning_seconds);

            if (
                !Number.isFinite(idleSeconds) ||
                idleSeconds <= 0 ||
                !Number.isFinite(warningSeconds) ||
                warningSeconds <= 0
            ) {
                return;
            }

            lastHumanActivity.current = Date.now();
            lastServerSync.current = Date.now();
            policyReady.current = true;

            setPolicy({
                idleSeconds,
                warningSeconds,
            });
        };

        const heartbeat = async () => {
            if (
                disposed ||
                logoutStarted.current ||
                !policyReady.current ||
                heartbeatInFlight.current
            ) {
                return;
            }

            if (
                document.visibilityState !==
                "visible"
            ) {
                return;
            }

            heartbeatInFlight.current = true;

            try {
                const { response } = await request(
                    "/api/presence/heartbeat",
                    {
                        method: "POST",
                    },
                );

                if (response.status === 401) {
                    redirectToLogin();
                }
            } finally {
                heartbeatInFlight.current = false;
            }
        };

        const markOfflineOnClose = () => {
            if (logoutStarted.current) return;
            fetch(backendUrl("/api/presence/offline"), {
                method: "POST",
                credentials: "include",
                keepalive: true,
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": getCachedCsrfToken(),
                },
            }).catch(() => null);
        };

        void loadPolicy();

        HUMAN_ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, markHumanActivity, {
                passive: true,
            });
        });

        const firstHeartbeatId =
            window.setTimeout(
                heartbeat,
                15_000,
            );

        const heartbeatId =
            window.setInterval(
                heartbeat,
                60_000,
            );

        const clockId = window.setInterval(
            () => setClock(Date.now()),
            1000,
        );

        document.addEventListener("visibilitychange", heartbeat);

        window.addEventListener("pagehide", markOfflineOnClose);

        return () => {
            disposed = true;

            HUMAN_ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, markHumanActivity);
            });

            window.clearTimeout(firstHeartbeatId);
            window.clearInterval(heartbeatId);
            window.clearInterval(clockId);

            policyReady.current = false;
            activityInFlight.current = false;
            heartbeatInFlight.current = false;

            document.removeEventListener("visibilitychange", heartbeat);

            window.removeEventListener("pagehide", markOfflineOnClose);

            window.removeEventListener(
                LOGOUT_START_EVENT,
                stopForLogout,
            );
        };
    }, [location.pathname, isPublicPage]);

    const idleMs = policy ? policy.idleSeconds * 1000 : null;

    const warningMs = policy ? policy.warningSeconds * 1000 : null;

    const elapsedMs = policy
        ? Math.max(0, clock - lastHumanActivity.current)
        : 0;

    const remainingMs = idleMs ? Math.max(0, idleMs - elapsedMs) : 0;

    const warningVisible = Boolean(
        policy && warningMs && remainingMs > 0 && remainingMs <= warningMs,
    );

    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    useEffect(() => {
        if (!policy || remainingMs > 0 || logoutStarted.current) {
            return;
        }

        logoutStarted.current = true;
        setEndingSession(true);

        request("/logout", {
            method: "POST",
            body: JSON.stringify({
                reason: "idle",
            }),
        }).finally(() => {
            window.location.href = "/login";
        });
    }, [policy, remainingMs]);

    const staySignedIn = async () => {
        lastHumanActivity.current = Date.now();
        setClock(Date.now());

        const { response } = await request("/api/session/activity", {
            method: "POST",
            body: JSON.stringify({}),
        });

        if (response.status === 401) {
            window.location.href = "/login";
        }
    };

    const logoutNow = async () => {
        if (logoutStarted.current) return;

        logoutStarted.current = true;
        setEndingSession(true);

        await request("/logout", {
            method: "POST",
            body: JSON.stringify({
                reason: "manual",
            }),
        }).catch(() => null);

        window.location.href = "/login";
    };

    if (!warningVisible || isPublicPage) {
        return null;
    }

    return (
        <div className="session-warning-backdrop" role="presentation">
            <section
                className="session-warning-card"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-warning-title"
                aria-describedby="session-warning-description"
            >
                <div className="session-warning-icon">!</div>

                <div>
                    <p className="session-warning-label">Session Security</p>

                    <h2 id="session-warning-title">
                        You are about to be signed out
                    </h2>

                    <p
                        id="session-warning-description"
                        className="session-warning-copy"
                    >
                        No activity was detected. For your security, you will be
                        automatically logged out in
                        <strong>
                            {" "}
                            {remainingSeconds}{" "}
                            {remainingSeconds === 1 ? "second" : "seconds"}
                        </strong>
                        .
                    </p>
                </div>

                <div className="session-warning-actions">
                    <button
                        type="button"
                        className="session-warning-stay"
                        onClick={staySignedIn}
                        disabled={endingSession}
                    >
                        Stay Signed In
                    </button>

                    <button
                        type="button"
                        className="session-warning-logout"
                        onClick={logoutNow}
                        disabled={endingSession}
                    >
                        {endingSession ? "Signing Out..." : "Log Out Now"}
                    </button>
                </div>
            </section>
        </div>
    );
}
