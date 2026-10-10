import { backendUrl } from "../../config/api.js";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../../css/public/faq-cinematic.css";
import usePublicTheme from "../../hooks/usePublicTheme.js";
import PublicThemeSwitch from "../../components/shared/PublicThemeSwitch.jsx";
import CinematicReveal from "../../components/shared/CinematicReveal.jsx";
import CinematicTeamStory from "../../components/public/CinematicTeamStory.jsx";

function FAQ() {
  const { theme, toggleTheme } = usePublicTheme();

  const [content, setContent] = useState({
    about: null,
    faqs: [],
    team: [],
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(backendUrl("/api/public/website-content"), {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load FAQ content.");
        }

        return response.json();
      })
      .then((payload) => {
        if (!active) return;

        setContent({
          about: payload.about || null,
          faqs: Array.isArray(payload.faqs) ? payload.faqs : [],
          team: Array.isArray(payload.team) ? payload.team : [],
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
    if (!loading && window.location.hash === "#team") {
      window.requestAnimationFrame(() => {
        document.getElementById("team")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [loading]);

  const categories = useMemo(() => {
    const values = content.faqs
      .map((item) => item.category)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [content.faqs]);

  const filteredFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return content.faqs.filter((item) => {
      const categoryMatches =
        category === "All" || item.category === category;

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

      return categoryMatches && textMatches;
    });
  }, [content.faqs, query, category]);

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div className="cin-faq-page" data-theme={theme}>
      <header className="cin-faq-header">
        <Link to="/" className="cin-faq-brand">
          <span className="cin-faq-brand-mark">WBO</span>

          <span>
            <small>HOME COMFORT TECHNOLOGY</small>
            <strong>WALANG BROWN OUT</strong>
          </span>
        </Link>

        <nav className="cin-faq-nav" aria-label="FAQ navigation">
          <Link to="/">Home</Link>
          <Link to="/#inventory">Products</Link>
          <a href="#questions">FAQ</a>
          <a href="#team">Team</a>
        </nav>

        <div className="cin-faq-header-actions">
          <PublicThemeSwitch
            theme={theme}
            onToggle={toggleTheme}
          />

          <Link to="/" className="cin-faq-home-button">
            Back home
          </Link>
        </div>
      </header>

      <main>
        <section className="cin-faq-hero">
          <div className="cin-faq-hero-copy">
            <span className="cin-faq-kicker">
              NEED TO KNOW.
            </span>

            <h1>
              Answers,
              <br />
              without the noise.
            </h1>

            <p>
              Everything customers and reviewers need to know before placing
              an order or exploring the Walang Brownout system.
            </p>
          </div>

          <div className="cin-faq-hero-aside">
            <span>FAQ</span>
            <strong>
              Search.
              <br />
              Open.
              <br />
              Understand.
            </strong>
          </div>

          <a href="#questions" className="cin-faq-scroll">
            Scroll to questions ↓
          </a>
        </section>

        <section id="questions" className="cin-faq-content">
          <CinematicReveal className="cin-faq-heading">
            <div>
              <span className="cin-faq-kicker">
                FREQUENTLY ASKED QUESTIONS
              </span>

              <h2>
                What do you
                <br />
                want to know?
              </h2>
            </div>

            <p>
              Search by keyword or filter by topic. Each answer is still loaded
              from your existing website-content API.
            </p>
          </CinematicReveal>

          <div className="cin-faq-search-panel">
            <label className="cin-faq-search">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search questions, orders, products, inventory..."
                aria-label="Search frequently asked questions"
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </label>

            <div
              className="cin-faq-category-list"
              aria-label="Filter FAQ by category"
            >
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={category === item}
                  className={category === item ? "is-active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="cin-faq-state">
              Loading questions...
            </div>
          ) : null}

          {error ? (
            <div className="cin-faq-state is-error">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <>
              <div className="cin-faq-result-count" aria-live="polite">
                <strong>{filteredFaqs.length}</strong>
                <span>
                  question{filteredFaqs.length === 1 ? "" : "s"} shown
                </span>
              </div>

              <div className="cin-faq-list">
                {filteredFaqs.map((item, index) => (
                  <CinematicReveal
                    as="details"
                    className="cin-faq-item"
                    key={item.faq_id}
                    delay={(index % 6) * 45}
                  >
                    <summary>
                      <span className="cin-faq-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="cin-faq-question">
                        {item.category ? (
                          <small>{item.category}</small>
                        ) : null}

                        <strong>{item.question}</strong>
                      </span>

                      <span className="cin-faq-plus" aria-hidden="true">
                        +
                      </span>
                    </summary>

                    <div className="cin-faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </CinematicReveal>
                ))}

                {!filteredFaqs.length ? (
                  <div className="cin-faq-empty">
                    <strong>No matching questions.</strong>
                    <p>
                      Try another keyword or return to all FAQ topics.
                    </p>
                    <button type="button" onClick={clearFilters}>
                      Show all questions
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </section>

        <CinematicTeamStory team={content.team} />
      </main>

      <footer className="cin-faq-footer">
        <strong>WALANG BROWN OUT</strong>
        <span>© 2026 Walang BrownOut. All rights reserved.</span>
        <Link to="/">Home</Link>
      </footer>
    </div>
  );
}

export default FAQ;
