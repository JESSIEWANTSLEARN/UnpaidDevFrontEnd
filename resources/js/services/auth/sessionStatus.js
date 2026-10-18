import { createContext } from "react";
import { backendUrl } from "../../config/api.js";
import { createSessionStatusReader } from "../../utils/sessionStatusRequest.mjs";

// A gate supplies its confirmed result to descendants for this page entry only.
export const VerifiedSessionContext = createContext(null);

export const readSessionStatus = createSessionStatusReader(async () => {
    const response = await fetch(backendUrl("/api/session/status"), {
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return { response, data };
});
