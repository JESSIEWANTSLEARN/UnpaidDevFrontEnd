import React, { useEffect, useState } from "react";
import { backendUrl, loadCsrfToken } from "../../../config/api.js";
import "../../../../css/sales/support-chat.css";

export default function SalesSupportPanel({ previewMode = false }) {
  const [rows, setRows] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const api = async (url, options = {}) => {
    const method = String(options.method || "GET").toUpperCase();
    const token =
      method !== "GET" && method !== "HEAD"
        ? await loadCsrfToken()
        : "";

    const response = await fetch(backendUrl(url), {
      credentials: "include",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Support request failed.");
    }

    return data;
  };

  const openConversation = async (id) => {
    if (!id) return;
    const suffix = previewMode ? "?preview=1" : "";
    const data = await api(`/api/support/staff/conversations/${id}${suffix}`);
    setConversation(data.conversation || null);
  };

  const load = async () => {
    try {
      setError("");
      const suffix = previewMode ? "?preview=1" : "";
      const data = await api(`/api/support/staff/conversations${suffix}`);
      const list = data.conversations || [];
      setRows(list);

      const preferred =
        conversation?.conversation_id ||
        list.find((item) => item.status === "WAITING_STAFF")?.conversation_id ||
        list.find((item) => item.status === "ACTIVE")?.conversation_id ||
        list[0]?.conversation_id;

      if (preferred) {
        await openConversation(preferred);
      } else {
        setConversation(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode]);

  useEffect(() => {
    const timer = window.setInterval(() => load().catch(() => {}), 8000);
    return () => window.clearInterval(timer);
  }, [previewMode, conversation?.conversation_id]);

  const action = async (name, payload = {}) => {
    if (!conversation || previewMode) return;

    try {
      setBusy(true);
      setError("");

      const data = await api(
        `/api/support/staff/conversations/${conversation.conversation_id}/${name}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      setConversation(data.conversation || conversation);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const text = message.trim();
    setMessage("");
    await action("messages", { message: text });
  };

  return (
    <section className="sales-support-section">
      <div className="sales-support-title">
        <div>
          <span>CUSTOMER SUPPORT</span>
          <h2>Support conversations</h2>
          <p>Handle customer FAQ escalations and support messages.</p>
        </div>
        <button type="button" onClick={load} disabled={busy}>Refresh</button>
      </div>

      {previewMode && (
        <div className="sales-support-preview">
          Super Admin preview is read only.
        </div>
      )}

      {error && <div className="sales-support-error">{error}</div>}

      <div className="sales-support-layout">
        <aside className="sales-support-list">
          {rows.length ? (
            rows.map((item) => (
              <button
                type="button"
                key={item.conversation_id}
                className={
                  conversation?.conversation_id === item.conversation_id
                    ? "sales-support-ticket is-active"
                    : "sales-support-ticket"
                }
                onClick={() => openConversation(item.conversation_id)}
              >
                <div>
                  <strong>#{item.conversation_id} {item.customer_name}</strong>
                  <span>{item.status}</span>
                </div>
                <small>{item.subject || "Customer support"}</small>
                <p>{item.last_message || "No messages yet."}</p>
                <em>{item.assigned_name ? `Assigned: ${item.assigned_name}` : "Unassigned"}</em>
              </button>
            ))
          ) : (
            <div className="sales-support-empty">No support conversations yet.</div>
          )}
        </aside>

        <div className="sales-support-chat">
          {!conversation ? (
            <div className="sales-support-empty">Choose a support conversation.</div>
          ) : (
            <>
              <header>
                <div>
                  <span>{conversation.status}</span>
                  <h3>{conversation.subject || `Conversation #${conversation.conversation_id}`}</h3>
                  <small>
                    {conversation.customer?.name} · {conversation.customer?.email}
                  </small>
                </div>

                {!previewMode && conversation.status !== "CLOSED" && (
                  <div className="sales-support-actions">
                    {conversation.status !== "ACTIVE" && (
                      <button type="button" onClick={() => action("claim")} disabled={busy}>
                        Claim
                      </button>
                    )}
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => action("close")}
                      disabled={busy}
                    >
                      Close
                    </button>
                  </div>
                )}
              </header>

              <div className="sales-support-messages">
                {(conversation.messages || []).map((item) => (
                  <article
                    key={item.message_id}
                    className={`sales-support-message sender-${String(item.sender_type).toLowerCase()}`}
                  >
                    <div>
                      <strong>
                        {item.sender_type === "CUSTOMER"
                          ? conversation.customer?.name || "Customer"
                          : item.sender_type === "BOT"
                            ? "FAQ Bot"
                            : item.sender_type === "SYSTEM"
                              ? "System"
                              : item.sender_name || "Sales Support"}
                      </strong>
                      <time>{new Date(item.created_at).toLocaleString()}</time>
                    </div>
                    <p>{item.message}</p>
                  </article>
                ))}
              </div>

              {!previewMode && conversation.status !== "CLOSED" && (
                <form className="sales-support-composer" onSubmit={send}>
                  <textarea
                    rows={3}
                    maxLength={3000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Reply to the customer..."
                  />
                  <button type="submit" disabled={busy || !message.trim()}>
                    Send reply
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}