import React, { useEffect, useState } from "react";

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

/** Customer-only icon set used by the storefront and account experience. */
export function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    home: (<> <path d="M3 11.5 12 4l9 7.5" /> <path d="M5.5 10.5V20h13v-9.5" /> <path d="M9.5 20v-6h5v6" /> </>),
    products: (<> <path d="M4 7.5 12 3l8 4.5-8 4.5-8-4.5Z" /> <path d="M4 7.5V16.5L12 21l8-4.5v-9" /> <path d="M12 12v9" /> </>),
    orders: (<> <path d="M6 3h12v18H6z" /> <path d="M9 7h6M9 11h6M9 15h4" /> </>),
    user: (<> <circle cx="12" cy="8" r="3.5" /> <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" /> </>),
    search: (<> <circle cx="11" cy="11" r="6.5" /> <path d="m16 16 4 4" /> </>),
    cart: (<> <path d="M3 4h2l2.2 10.2h10.6L20 7H6" /> <circle cx="9" cy="19" r="1.3" /> <circle cx="17" cy="19" r="1.3" /> </>),
    bell: (<> <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /> <path d="M10 21h4" /> </>),
    moon: (<path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.6 8.6 0 1 0 20 15.2Z" />),
    sun: (<> <circle cx="12" cy="12" r="3.5" /> <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /> </>),
    menu: (<><path d="M4 7h16M4 12h16M4 17h16" /></>),
    close: (<> <path d="m6 6 12 12M18 6 6 18" /> </>),
    arrow: (<> <path d="M5 12h14" /> <path d="m14 7 5 5-5 5" /> </>),
    check: (<path d="m5 12 4 4L19 6" />),
    minus: (<path d="M6 12h12" />),
    plus: (<> <path d="M6 12h12M12 6v12" /> </>),
    logout: (<> <path d="M10 5H5v14h5" /> <path d="M13 8l4 4-4 4M17 12H9" /> </>),
  };

  return <svg {...common}>{paths[name] ?? paths.products}</svg>;
}

export function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  return <span className={`customer-status customer-status-${key}`}>{status || "UNKNOWN"}</span>;
}

export function EmptyState({ title, text }) {
  return (
    <div className="customer-empty">
      <div className="customer-empty-icon"><Icon name="products" size={24} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function ProfileAvatar({ user, className = "" }) {
  const photoUrl = user?.has_profile_photo
    ? `/api/user/profile-photo?v=${encodeURIComponent(user.profile_photo_version ?? "1")}`
    : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  return (
    <div className={`customer-avatar ${className}`.trim()} aria-label={`${user?.name ?? "User"} profile photo`}>
      {photoUrl && !failed ? (
        <img src={photoUrl} alt={`${user?.name ?? "User"} profile`} onError={() => setFailed(true)} />
      ) : (
        <span>{getInitials(user?.name)}</span>
      )}
    </div>
  );
}
