/** Merge authoritative sections, preserving all unrelated data and metric keys. */
export function mergeDashboardUpdate(current, update) {
  if (!current || !update || typeof update !== "object") return current;
  const { metrics, alerts, replace_alert_titles, ...sections } = update;
  const next = { ...current, ...sections };
  if (metrics) next.metrics = { ...current.metrics, ...metrics };
  if (Array.isArray(alerts)) {
    next.alerts = Array.isArray(replace_alert_titles)
      ? [...(current.alerts || []).filter((item) => !replace_alert_titles.includes(item.title)), ...alerts]
      : alerts;
  }
  return next;
}

export function importRefreshSections(result, admin = false) {
  const type = result?.import?.import_type;
  if (type === "PRODUCTS") return admin
    ? ["products", "categories", "suppliers", "audit_logs", "notifications"]
    : ["products", "suppliers"];
  if (type === "SUPPLIERS") return admin ? ["suppliers", "audit_logs"] : ["suppliers", "products", "purchase_orders"];
  return null;
}

/** Serialize scoped reads; retry if a newer mutation invalidated an in-flight snapshot. */
export function queueDashboardRefresh(queue, revision, load, apply, onError) {
  const job = async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const started = revision.current;
        const result = await load();
        if (started !== revision.current) continue;
        apply(result);
        return;
      }
      throw new Error("Data changed during refresh. Use Refresh to load the latest data.");
    } catch (error) { onError(error); }
  };
  queue.current = queue.current.then(job, job);
  return queue.current;
}
