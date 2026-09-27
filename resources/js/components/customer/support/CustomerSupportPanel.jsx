import React, { useEffect, useState } from "react";
import { backendUrl, loadCsrfToken } from "../../../config/api.js";
import { EmptyState } from "../CustomerUi.jsx";
import "../../../../css/customer/support-chat.css";

export default function CustomerSupportPanel({ previewMode = false }) {
  const [rows, setRows] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Customer support");
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
    if (!id || previewMode) return;
    const data = await api(`/api/user/support/conversations/${id}`);
    setConversation(data.conversation || null);
  };

  const load = async () => {
    if (previewMode) return;

    try {
      setError("");
      const data = await api("/api/user/support/conversations");
      const list = data.conversations || [];
      setRows(list);

      const preferred =
        conversation?.conversation_id ||
        list.find((item) => item.status !== "CLOSED")?.conversation_id ||
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
    if (previewMode || !conversation?.conversation_id) return undefined;

    const timer = window.setInterval(
      () => openConversation(conversation.conversation_id).catch(() => {}),
      8000,
    );

    return () => window.clearInterval(timer);
  }, [previewMode, conversation?.conversation_id]);

  const start = async () => {
    try {
      setBusy(true);
      setError("");

      const data = await api("/api/user/support/conversations", {
        method: "POST",
        body: JSON.stringify({ subject }),
      });

      setConversation(data.conversation || null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (event) => {
    event.preventDefault();
    if (!conversation || !message.trim()) return;

    try {
      setBusy(true);
      setError("");

      const data = await api(
        `/api/user/support/conversations/${conversation.conversation_id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: message.trim() }),
        },
      );

      setMessage("");
      setConversation(data.conversation || conversation);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const action = async (name) => {
    if (!conversation) return;

    try {
      setBusy(true);
      setError("");

      const data = await api(
        `/api/user/support/conversations/${conversation.conversation_id}/${name}`,
        { method: "POST", body: "{}" },
      );

      setConversation(data.conversation || conversation);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (previewMode) {
    return (
      <section className="customer-page-section">
        <div className="customer-page-title">
          <div>
            <span className="customer-kicker">CUSTOMER SUPPORT</span>
            <h1>Support and FAQ chat</h1>
            <p>Customer support conversations stay private in Super Admin preview.</p>
          </div>
        </div>
        <EmptyState
          title="Private support conversations protected"
          text="Log in as a System User to use the support chat."
        />
      </section>
    );
  }

  return (
    <section className="customer-page-section">
      <div className="customer-page-title">
        <div>
          <span className="customer-kicker">CUSTOMER SUPPORT</span>
          <h1>Support and FAQ chat</h1>
          <p>Ask the FAQ bot first, then transfer the conversation to Sales Support when needed.</p>
        </div>
      </div>

      {error && <div className="wbo-support-error">{error}</div>}

      <div className="wbo-support-layout">
        <aside className="wbo-support-list">
          <div className="wbo-support-list-head">
            <strong>Conversations</strong>
            <button type="button" onClick={load} disabled={busy}>Refresh</button>
          </div>

          {rows.map((item) => (
            <button
              type="button"
              key={item.conversation_id}
              className={
                conversation?.conversation_id === item.conversation_id
                  ? "wbo-support-ticket is-active"
                  : "wbo-support-ticket"
              }
              onClick={() => openConversation(item.conversation_id)}
            >
              <strong>#{item.conversation_id} {item.subject || "Support"}</strong>
              <span>{item.status}</span>
              <small>{item.last_message || "No messages yet."}</small>
            </button>
          ))}

          {!rows.some((item) => item.status !== "CLOSED") && (
            <div className="wbo-support-new">
              <label>
                <span>Topic</span>
                <input
                  maxLength={150}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </label>
              <button type="button" onClick={start} disabled={busy}>
                Start support chat
              </button>
            </div>
          )}
        </aside>

        <div className="wbo-support-chat">
          {!conversation ? (
            <EmptyState
              title="Start a support conversation"
              text="The FAQ bot answers common questions and can transfer you to staff."
            />
          ) : (
            <>
              <header>
                <div>
                  <span>{conversation.status}</span>
                  <h2>{conversation.subject || `Conversation #${conversation.conversation_id}`}</h2>
                  <small>
                    {conversation.assigned_staff
                      ? `Assigned to ${conversation.assigned_staff.name}`
                      : "Not assigned to staff"}
                  </small>
                </div>

                <div className="wbo-support-actions">
                  {conversation.status === "BOT" && (
                    <button type="button" onClick={() => action("escalate")} disabled={busy}>
                      Talk to staff
                    </button>
                  )}
                  {conversation.status !== "CLOSED" && (
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => action("close")}
                      disabled={busy}
                    >
                      Close
                    </button>
                  )}
                </div>
              </header>

              <div className="wbo-support-messages">
                {(conversation.messages || []).map((item) => (
                  <article
                    key={item.message_id}
                    className={`wbo-support-message sender-${String(item.sender_type).toLowerCase()}`}
                  >
                    <div>
                      <strong>
                        {item.sender_type === "CUSTOMER"
                          ? "You"
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

              {conversation.status !== "CLOSED" ? (
                <form className="wbo-support-composer" onSubmit={send}>
                  <textarea
                    rows={3}
                    maxLength={3000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={
                      conversation.status === "BOT"
                        ? "Ask about products, orders, payment, delivery, or the store..."
                        : "Write a message to Sales Support..."
                    }
                  />
                  <button type="submit" disabled={busy || !message.trim()}>
                    Send
                  </button>
                </form>
              ) : (
                <div className="wbo-support-closed">
                  Conversation closed. Start a new one if you need more help.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}