import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { readSessionStatus, VerifiedSessionContext } from "../../../services/auth/sessionStatus.js";

/** Prevent role-protected React pages from rendering until the server confirms the session role. */
export default function SessionRoleGate({ role, children }) {
    const [state, setState] = useState("checking");
    const [attempt, setAttempt] = useState(0);
    const [verified, setVerified] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function verifyRole() {
            setState("checking");

            try {
                // Cleanup detaches this consumer without aborting other subscribers.
                const { response, data } = await readSessionStatus();

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

                setVerified({ role, data });
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

    if (state !== "allowed" || verified?.role !== role) {
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

    return <VerifiedSessionContext.Provider value={verified.data}>{children}</VerifiedSessionContext.Provider>;
}
