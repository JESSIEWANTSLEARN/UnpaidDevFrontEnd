import React from "react";
import Empty from "../common/Empty.jsx";

export default function Alerts({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <Empty text="No current operational alerts." />
    );
  }

  return (
    <div className="role-live-alerts">
      {alerts.map((alert, index) => (
        <article
          key={`${alert.title}-${index}`}
          className={`role-live-alert tone-${alert.tone || "info"}`}
        >
          <strong>{alert.title}</strong>
          <p>{alert.message}</p>
        </article>
      ))}
    </div>
  );
}
