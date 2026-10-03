import CinematicReveal from "../shared/CinematicReveal.jsx";
import { backendUrl } from "../../config/api.js";

/*
 * Movie-like team presentation.
 * Team names, roles, descriptions, and photos remain backend-managed.
 */
export default function CinematicTeamStory({ team = [] }) {
  if (!team.length) {
    return (
      <section id="team" className="cin-team-section">
        <div className="cin-team-empty">
          Team profiles will appear here once they are published.
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="cin-team-section">
      <div className="cin-team-intro">
        <span className="cin-faq-kicker">THE PEOPLE BEHIND THE SYSTEM</span>
        <h2>
          Built by a team.
          <br />
          Shaped as one system.
        </h2>
        <p>
          Scroll through the development team behind Walang Brownout.
        </p>
      </div>

      <div className="cin-team-story">
        {team.map((member, index) => (
          <CinematicReveal
            as="article"
            className="cin-team-member"
            key={member.team_member_id ?? `${member.name}-${index}`}
          >
            <div className="cin-team-member-index">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="cin-team-member-media">
              {member.photo_url ? (
                <img
                  src={backendUrl(member.photo_url)}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="cin-team-initials" aria-label={member.name}>
                  {(member.name || "")
                    .split(/\s+/)
                    .map((part) => part.charAt(0))
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}

              <div className="cin-team-media-overlay" aria-hidden="true" />
            </div>

            <div className="cin-team-member-copy">
              <span>{member.role || "Development Team"}</span>
              <h3>{member.name}</h3>

              {member.description ? (
                <p>{member.description}</p>
              ) : (
                <p>
                  Part of the team that designed, developed, tested, and
                  refined the Walang Brownout system.
                </p>
              )}
            </div>
          </CinematicReveal>
        ))}
      </div>

      <CinematicReveal className="cin-team-outro">
        <span>SIX PEOPLE. ONE SYSTEM.</span>
        <strong>WALANG BROWN OUT.</strong>
      </CinematicReveal>
    </section>
  );
}
