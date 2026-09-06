import React, { useEffect, useState } from "react";
import "../../../../css/super-admin/system-health.css";
export default function SystemHealthView() {
    const [data, setData] = useState(null),
        [loading, setLoading] = useState(true),
        [error, setError] = useState("");
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const r = await fetch("/api/super-admin/system-health", {
                credentials: "same-origin",
                headers: { Accept: "application/json" },
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok)
                throw new Error(d?.message || "System health check failed.");
            setData(d);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    if (loading)
        return (
            <div className="system-health-state">Running system checks...</div>
        );
    if (!data)
        return (
            <div className="system-health-error">
                {error}
                <button onClick={load}>Retry</button>
            </div>
        );
    const healthy = Number(data.healthy_checks || 0),
        total = Math.max(1, Number(data.total_checks || 0)),
        width = `${Math.round((healthy / total) * 100)}%`;
    return (
        <section className="system-health-page">
            <div className="system-health-heading">
                <div>
                    <span>Monitoring</span>
                    <h1>System Health</h1>
                    <p>
                        Real checks only. No fabricated CPU, RAM, uptime, or
                        server-health numbers.
                    </p>
                </div>
                <button onClick={load}>Run Checks</button>
            </div>
            <div
                className={`system-health-summary overall-${String(data.overall_status).toLowerCase()}`}
            >
                <div>
                    <span>Overall Status</span>
                    <strong>{data.overall_status}</strong>
                </div>
                <div>
                    <strong>
                        {healthy}/{total}
                    </strong>
                    <span>checks healthy</span>
                </div>
            </div>
            <div
                className="system-health-bar"
                role="meter"
                aria-valuemin="0"
                aria-valuemax={total}
                aria-valuenow={healthy}
            >
                <span style={{ width }} />
            </div>
            <p className="system-health-explainer">
                The bar is the ratio of checks passing, not a fake
                infrastructure performance percentage.
            </p>
            <div className="system-health-grid">
                {(data.checks || []).map((c) => (
                    <article
                        className={`system-health-card status-${String(c.status).toLowerCase()}`}
                        key={c.key}
                    >
                        <div className="system-health-card-head">
                            <div>
                                <span>{c.label}</span>
                                <strong>{c.status}</strong>
                            </div>
                            <i />
                        </div>
                        <p>{c.detail}</p>
                        {c.latency_ms != null && (
                            <small>Database response: {c.latency_ms} ms</small>
                        )}
                        {c.active_sessions != null && (
                            <small>
                                Active tracked sessions: {c.active_sessions}
                            </small>
                        )}
                        {c.note && <small>{c.note}</small>}
                    </article>
                ))}
            </div>
            <small className="system-health-time">
                Last checked: {new Date(data.checked_at).toLocaleString()}
            </small>
        </section>
    );
}
