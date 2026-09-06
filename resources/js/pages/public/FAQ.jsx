import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../../css/public/faq.css";

function FAQ() {
  const [content, setContent] = useState({
    about: null,
    faqs: [],
    team: [],
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/public/website-content", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Unable to load FAQ content."
          );
        }

        return response.json();
      })
      .then((payload) => {
        if (!active) return;

        setContent({
          about: payload.about || null,
          faqs: Array.isArray(payload.faqs)
            ? payload.faqs
            : [],
          team: Array.isArray(payload.team)
            ? payload.team
            : [],
        });
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !loading &&
      window.location.hash === "#team"
    ) {
      window.requestAnimationFrame(() => {
        document
          .getElementById("team")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    }
  }, [loading]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          content.faqs.map(
            (item) => item.category
          )
        )
      ),
    ],
    [content.faqs]
  );

  const filteredFaqs = useMemo(() => {
    const needle =
      query.trim().toLowerCase();

    return content.faqs.filter((item) => {
      const categoryMatches =
        category === "All" ||
        item.category === category;

      const textMatches =
        !needle ||
        (
          (item.question || "") +
          " " +
          (item.answer || "") +
          " " +
          (item.category || "")
        )
          .toLowerCase()
          .includes(needle);

      return (
        categoryMatches &&
        textMatches
      );
    });
  }, [content.faqs, query, category]);

  return (
    <div className="faq-page faq-page-enter">
      <header className="faq-header">
        <div className="faq-shell faq-header-inner">
          <Link
            to="/"
            className="faq-brand"
            aria-label="Walang BrownOut home"
          >
            <span
              className="faq-brand-mark"
              aria-hidden="true"
            >
              WBO
            </span>

            <span>
              <small>
                Republic of the Philippines
              </small>
              <strong>
                WALANG BROWN OUT
              </strong>
            </span>
          </Link>

          <nav
            className="faq-top-links"
            aria-label="FAQ navigation"
          >
            <Link to="/">Home</Link>
            <Link to="/#inventory">
              Products
            </Link>
            <a href="#team">
              Development Team
            </a>
          </nav>

          <Link
            to="/"
            className="faq-home-button"
          >
            Back to Home
          </Link>
        </div>

        <div className="faq-shell faq-search-row">
          <label className="faq-search">
            <svg
              className="faq-search-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search questions, inventory, orders, suppliers..."
              aria-label="Search frequently asked questions"
            />

            {query ? (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                aria-label="Clear search"
              >
                &times;
              </button>
            ) : null}
          </label>
        </div>
      </header>

      <main>
        <section className="faq-hero">
          <div className="faq-shell faq-hero-inner">
            <div>
              <span className="faq-eyebrow">
                HELP CENTER
              </span>
              <h1>
                Frequently Asked Questions
              </h1>
              <p>
                Find answers about inventory,
                customer orders, purchase
                orders, suppliers, product
                availability, account access,
                and the Walang BrownOut
                project.
              </p>
            </div>

            <aside className="faq-hero-card">
              <span>?</span>
              <div>
                <strong>
                  Need a quick answer?
                </strong>
                <small>
                  Search above or choose a
                  topic below.
                </small>
              </div>
            </aside>
          </div>
        </section>

        <section className="faq-shell faq-content">
          {loading ? (
            <div className="faq-state">
              Loading FAQs...
            </div>
          ) : null}

          {error ? (
            <div className="faq-state error">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <>
              <div className="faq-topic-bar">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      category === item
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setCategory(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="faq-results-head">
                <strong>
                  {filteredFaqs.length}
                </strong>
                <span>
                  question
                  {filteredFaqs.length === 1
                    ? ""
                    : "s"}{" "}
                  shown
                </span>
              </div>

              <div className="faq-list">
                {filteredFaqs.map(
                  (item, index) => (
                    <details
                      className="faq-item"
                      key={item.faq_id}
                      open={
                        index === 0 &&
                        !query &&
                        category === "All"
                      }
                    >
                      <summary>
                        <span>
                          <small>
                            {item.category}
                          </small>
                          <strong>
                            {item.question}
                          </strong>
                        </span>
                        <b
                          className="faq-plus"
                          aria-hidden="true"
                        >
                          +
                        </b>
                      </summary>

                      <div className="faq-answer">
                        <p>
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  )
                )}

                {filteredFaqs.length ===
                0 ? (
                  <div className="faq-empty">
                    <strong>
                      No matching questions
                    </strong>
                    <p>
                      Try another search or
                      category.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setCategory("All");
                      }}
                    >
                      Show all questions
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </section>

        <section
          id="team"
          className="faq-team"
        >
          <div className="faq-shell">
            <div className="faq-team-heading">
              <span className="faq-eyebrow">
                PROJECT CREDITS
              </span>
              <h2>
                Walang BrownOut Development
                Team
              </h2>
              <p>
                The people who planned,
                developed, coordinated, and
                reviewed the system.
              </p>
            </div>

            <div className="faq-team-grid">
              {content.team.map((member) => (
                <article
                  className="faq-team-card"
                  key={
                    member.team_member_id
                  }
                >
                  <div className="faq-team-avatar">
                    {member.photo_url ? (
                      <img
                        src={
                          member.photo_url
                        }
                        alt={member.name}
                      />
                    ) : (
                      <span>
                        {(member.name || "")
                          .split(/\s+/)
                          .map((part) =>
                            part.charAt(0)
                          )
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3>{member.name}</h3>
                    <strong>
                      {member.role}
                    </strong>
                    {member.description ? (
                      <p>
                        {member.description}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="faq-footer">
        <div className="faq-shell">
          <span>
&copy; 2026 Walang BrownOut. All rights reserved.
          </span>
          <Link to="/">Home</Link>
        </div>
      </footer>
    </div>
  );
}

export default FAQ;