import { Link } from "react-router-dom";
import { backendUrl } from "../../config/api.js";
import PublicThemeSwitch from "./PublicThemeSwitch.jsx";
import "../../../css/shared/cinematic-customer.css";

const Logo = backendUrl("/storage/site/Logo.png");
const showcaseImage = backendUrl("/storage/site/mainpic.jpg");

/*
 * Shared presentation shell for customer authentication pages.
 * Forms keep their own API/business logic; this component only controls layout.
 */
function CinematicAuthLayout({
  theme,
  toggleTheme,
  eyebrow,
  title,
  description,
  backTo = "/",
  backLabel = "Back to home",
  footerText,
  footerLinkTo,
  footerLinkLabel,
  children,
}) {
  return (
    <div className="wbo-auth-cinematic" data-theme={theme}>
      <div className="cinematic-auth-stage">
        <section className="cinematic-auth-visual" aria-label="Walang Brownout brand showcase">
          <img
            className="cinematic-auth-background"
            src={showcaseImage}
            alt=""
            aria-hidden="true"
          />

          <div className="cinematic-auth-visual-overlay" />

          <Link to="/" className="cinematic-auth-brand">
            <img src={Logo} alt="Walang Brown Out Logo" width="48" height="48" />
            <span>
              <small>HOME COMFORT TECHNOLOGY</small>
              <strong>WALANG BROWN OUT</strong>
            </span>
          </Link>

          <div className="cinematic-auth-story">
            <span className="cinematic-kicker">SMARTER EVERYDAY COMFORT</span>

            <h1>
              Comfort,
              <br />
              connected.
            </h1>

            <p>
              Shop home-comfort products backed by live warehouse availability,
              secure customer accounts, and reliable order support.
            </p>

            <div className="cinematic-auth-points">
              <span>Live inventory</span>
              <span>Secure OTP</span>
              <span>Customer support</span>
            </div>
          </div>

          <div className="cinematic-auth-glow" aria-hidden="true" />
        </section>

        <section className="cinematic-auth-panel">
          <div className="cinematic-auth-panel-top">
            <Link to={backTo} className="cinematic-back-link">
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>

            <PublicThemeSwitch theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="cinematic-auth-content">
            <div className="cinematic-auth-heading">
              <span className="cinematic-kicker">{eyebrow}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>

            {children}

            {footerText && footerLinkTo && footerLinkLabel ? (
              <p className="cinematic-auth-switch">
                {footerText}{" "}
                <Link to={footerLinkTo}>{footerLinkLabel}</Link>
              </p>
            ) : null}
          </div>

          <footer className="cinematic-auth-footer">
            © 2026 WalangBrownOut. All rights reserved.
          </footer>
        </section>
      </div>
    </div>
  );
}

export default CinematicAuthLayout;
