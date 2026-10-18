import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { backendUrl } from "../../../config/api.js";

/** Prevent role-protected React pages from rendering until the server confirms the session role. */
export default function SessionRoleGate({ role, children }) {
    const [state, setState] = useState("checking");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function verifyRole() {
            setState("checking");

            try {
                const response = await fetch(
                    backendUrl("/api/session/status"),
                    {
                        credentials: "include",
                        headers: { Accept: "application/json" },
                        signal: controller.signal,
                    },
                );

                const data = await response.json().catch(() => ({}));

                if (controller.signal.aborted) return;

                if (
                    response.status === 401 ||
                    (response.ok &&
                        (data.authenticated !== true || data.role !== role))
                ) {
                    setState("denied");
                    return;
                }

                if (!response.ok) {
                    setState("unavailable");
                    return;
                }

                setState("allowed");
            } catch {
                if (!controller.signal.aborted) setState("unavailable");
            }
        }

        void verifyRole();
        return () => controller.abort();
    }, [role, attempt]);

    if (state === "denied") {
        return <Navigate to="/login" replace />;
    }

    if (state !== "allowed") {
        return (
            <main
                role="status"
                aria-live="polite"
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeContent: "center",
                    gap: "12px",
                    padding: "24px",
                    textAlign: "center",
                    color: "#334155",
                    background: "#f8fafc",
                }}
            >
                <p>
                    {state === "checking"
                        ? "Checking your access…"
                        : "Unable to verify access. Protected content is hidden."}
                </p>
                {state === "unavailable" && (
                    <div>
                        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                            Try again
                        </button>{" "}
                        <a href="/login">Go to login</a>
                    </div>
                )}
            </main>
        );
    }

    return children;
}
