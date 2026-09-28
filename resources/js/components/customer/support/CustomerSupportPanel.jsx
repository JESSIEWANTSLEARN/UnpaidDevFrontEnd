import React, { useEffect, useRef, useState } from "react";
import { backendUrl, loadCsrfToken } from "../../../config/api.js";
import { EmptyState } from "../CustomerUi.jsx";
import SupportQuickReplies from "./SupportQuickReplies.jsx";
import SupportContextCard from "./SupportContextCard.jsx";
import SupportContextPicker from "./SupportContextPicker.jsx";
import "../../../../css/customer/support-chat.css";

export default function CustomerSupportPanel({
  previewMode = false,
  products = [],
  orders = [],
  onOpenProduct,
  onOpenOrder,
}) {
  const [rows, setRows] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Customer support");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState(null);
  const [context, setContext] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesRef = useRef(null);

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
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || "Support request failed.",
      );
    }

    return data;
  };

  const openConversation = async (id) => {
    if (!id || previewMode) return;

    const data = await api(
      `/api/user/support/conversations/${id}`,
    );

    setConversation(data.conversation || null);
  };

  const load = async () => {
    if (previewMode) return;

    try {
      setError("");

      const data = await api(
        "/api/user/support/conversations",
      );

      const list = data.conversations || [];
      setRows(list);

      const preferred =
        conversation?.conversation_id ||
        list.find(
          (item) => item.status !== "CLOSED",
        )?.conversation_id ||
        list[0]?.conversation_id;

      if (preferred) {
        await openConversation(preferred);
      } else {
        setConversation(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    load();
  }, [previewMode]);

  useEffect(() => {
    if (
      previewMode ||
      !conversation?.conversation_id
    ) {
      return undefined;
    }

    const timer = window.setInterval(
      () =>
        openConversation(
          conversation.conversation_id,
        ).catch(() => {}),
      8000,
    );

    return () => window.clearInterval(timer);
  }, [
    previewMode,
    conversation?.conversation_id,
  ]);

  useEffect(() => {
    if (!conversation || !messagesRef.current) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const node = messagesRef.current;

      if (node) {
        node.scrollTo({
          top: node.scrollHeight,
          behavior: "smooth",
        });
      }
    });

    return () =>
      window.cancelAnimationFrame(frame);
  }, [
    conversation?.conversation_id,
    conversation?.messages?.length,
    context?.type,
    context?.value?.product_id,
    context?.value?.order_id,
  ]);

  useEffect(() => {
    if (previewMode) return;

    try {
      const raw = sessionStorage.getItem(
        "wbo_support_context",
      );

      if (!raw) return;

      const saved = JSON.parse(raw);

      if (saved.type === "product") {
        const product = products.find(
          (item) =>
            Number(item.product_id) ===
            Number(saved.product_id),
        );

        if (product) {
          setContext({
            type: "product",
            value: product,
          });
        }
      }

      sessionStorage.removeItem(
        "wbo_support_context",
      );
    } catch {
      sessionStorage.removeItem(
        "wbo_support_context",
      );
    }
  }, [previewMode, products]);

  const start = async () => {
    try {
      setBusy(true);
      setError("");

      const data = await api(
        "/api/user/support/conversations",
        {
          method: "POST",
          body: JSON.stringify({ subject }),
        },
      );

      setConversation(
        data.conversation || null,
      );

      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const sendText = async (text) => {
    const clean = String(text || "").trim();

    if (!conversation || !clean) return;

    try {
      setBusy(true);
      setError("");

      const data = await api(
        `/api/user/support/conversations/${conversation.conversation_id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            message: clean,
          }),
        },
      );

      setMessage("");
      setConversation(
        data.conversation || conversation,
      );

      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const send = async (event) => {
    event.preventDefault();
    await sendText(message);
  };

  const sendQuickReply = async (question) => {
    let prefix = "";

    if (context?.type === "order") {
      prefix =
        `[Order #${context.value.order_id} - ` +
        `${context.value.status}] `;
    }

    if (context?.type === "product") {
      prefix =
        `[Product #${context.value.product_id} - ` +
        `${context.value.name}] `;
    }

    await sendText(prefix + question);
  };

  const action = async (name) => {
    if (!conversation) return;

    try {
      setBusy(true);
      setError("");

      const data = await api(
        `/api/user/support/conversations/${conversation.conversation_id}/${name}`,
        {
          method: "POST",
          body: "{}",
        },
      );

      setConversation(
        data.conversation || conversation,
      );

      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const chooseContext = (nextContext) => {
    setContext(nextContext);
    setPicker(null);
    setMenuOpen(false);
  };

  if (previewMode) {
    return (
      <section className="customer-page-section">
        <div className="customer-page-title">
          <div>
            <span className="customer-kicker">
              CUSTOMER SUPPORT
            </span>
            <h1>Support assistant</h1>
            <p>
              Customer support conversations stay private
              in Super Admin preview.
            </p>
          </div>
        </div>

        <EmptyState
          title="Private support conversations protected"
          text="Log in as a System User to use the support assistant."
        />
      </section>
    );
  }

  return (
    <section className="customer-page-section">
      <div className="customer-page-title">
        <div>
          <span className="customer-kicker">
            CUSTOMER SUPPORT
          </span>
          <h1>Walang Brownout Assistant</h1>
          <p>
            Choose a quick concern, attach an order or
            product, or transfer to Sales Support.
          </p>
        </div>
      </div>

      {error && (
        <div className="wbo-support-error">
          {error}
        </div>
      )}

      <div className="wbo-support-layout">
        <aside className="wbo-support-list">
          <div className="wbo-support-list-head">
            <strong>Conversations</strong>

            <button
              type="button"
              onClick={load}
              disabled={busy}
            >
              Refresh
            </button>
          </div>

          {rows.map((item) => (
            <button
              type="button"
              key={item.conversation_id}
              className={
                conversation?.conversation_id ===
                item.conversation_id
                  ? "wbo-support-ticket is-active"
                  : "wbo-support-ticket"
              }
              onClick={() =>
                openConversation(
                  item.conversation_id,
                )
              }
            >
              <strong>
                #{item.conversation_id}{" "}
                {item.subject || "Support"}
              </strong>
              <span>{item.status}</span>
              <small>
                {item.last_message ||
                  "No messages yet."}
              </small>
            </button>
          ))}

          {!rows.some(
            (item) => item.status !== "CLOSED",
          ) && (
            <div className="wbo-support-new">
              <label>
                <span>Topic</span>

                <input
                  maxLength={150}
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                />
              </label>

              <button
                type="button"
                onClick={start}
                disabled={busy}
              >
                Start support chat
              </button>
            </div>
          )}
        </aside>

        <div className="wbo-support-chat">
          {!conversation ? (
            <div className="wbo-support-welcome">
              <div className="wbo-support-bot-circle">
                WB
              </div>

              <h2>How can we help?</h2>

              <p>
                Start a chat to use guided FAQ questions,
                order help, product help, and Sales Support.
              </p>

              <button
                type="button"
                onClick={start}
                disabled={busy}
              >
                Start support chat
              </button>
            </div>
          ) : (
            <>
              <header>
                <div>
                  <span>{conversation.status}</span>

                  <h2>
                    {conversation.subject ||
                      `Conversation #${conversation.conversation_id}`}
                  </h2>

                  <small>
                    {conversation.assigned_staff
                      ? `Assigned to ${conversation.assigned_staff.name}`
                      : conversation.status === "BOT"
                        ? "FAQ Bot is assisting you"
                        : "Waiting for Sales Support"}
                  </small>
                </div>

                <div className="wbo-support-actions">
                  {conversation.status === "BOT" && (
                    <button
                      type="button"
                      onClick={() =>
                        action("escalate")
                      }
                      disabled={busy}
                    >
                      Talk to staff
                    </button>
                  )}

                  {conversation.status !==
                    "CLOSED" && (
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() =>
                        action("close")
                      }
                      disabled={busy}
                    >
                      Close
                    </button>
                  )}
                </div>
              </header>

              <div className="wbo-support-messages" ref={messagesRef}>
                {(conversation.messages || []).map(
                  (item) => (
                    <article
                      key={item.message_id}
                      className={`wbo-support-message sender-${String(
                        item.sender_type,
                      ).toLowerCase()}`}
                    >
                      <div>
                        <strong>
                          {item.sender_type ===
                          "CUSTOMER"
                            ? "You"
                            : item.sender_type ===
                                "BOT"
                              ? "FAQ Bot"
                              : item.sender_type ===
                                  "SYSTEM"
                                ? "System"
                                : item.sender_name ||
                                  "Sales Support"}
                        </strong>

                        <time>
                          {new Date(
                            item.created_at,
                          ).toLocaleString()}
                        </time>
                      </div>

                      <p>{item.message}</p>
                    </article>
                  ),
                )}

                {conversation.status !== "CLOSED" &&
                  context && (
                    <div className="wbo-support-context-message">
                      <SupportContextCard
                        context={context}
                        onClear={() =>
                          setContext(null)
                        }
                        onOpen={() => {
                          if (
                            context?.type === "product" &&
                            onOpenProduct
                          ) {
                            onOpenProduct(context.value);
                          }

                          if (
                            context?.type === "order" &&
                            onOpenOrder
                          ) {
                            onOpenOrder(context.value);
                          }
                        }}
                      />
                    </div>
                  )}
              </div>

              {conversation.status !== "CLOSED" ? (
                <>
                  {conversation.status === "BOT" && (
                    <SupportQuickReplies
                      context={context}
                      busy={busy}
                      onSelect={sendQuickReply}
                    />
                  )}

                  <SupportContextPicker
                    mode={picker}
                    orders={orders}
                    products={products}
                    onSelect={chooseContext}
                    onClose={() =>
                      setPicker(null)
                    }
                  />

                  <form
                    className="wbo-support-composer wbo-support-guided-composer"
                    onSubmit={send}
                  >
                    <div className="wbo-support-plus-wrap">
                      <button
                        type="button"
                        className="wbo-support-plus-button"
                        onClick={() =>
                          setMenuOpen(
                            (open) => !open,
                          )
                        }
                        aria-label="Attach order or product"
                      >
                        +
                      </button>

                      {menuOpen && (
                        <div className="wbo-support-plus-menu">
                          <button
                            type="button"
                            onClick={() => {
                              setPicker("orders");
                              setMenuOpen(false);
                            }}
                          >
                            Orders
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPicker("products");
                              setMenuOpen(false);
                            }}
                          >
                            Products
                          </button>
                        </div>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      maxLength={3000}
                      value={message}
                      onChange={(event) =>
                        setMessage(event.target.value)
                      }
                      placeholder={
                        conversation.status === "BOT"
                          ? "Ask a question or choose a quick option..."
                          : "Write a message to Sales Support..."
                      }
                    />

                    <button
                      type="submit"
                      disabled={
                        busy || !message.trim()
                      }
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="wbo-support-closed">
                  Conversation closed. Start a new one
                  if you need more help.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}