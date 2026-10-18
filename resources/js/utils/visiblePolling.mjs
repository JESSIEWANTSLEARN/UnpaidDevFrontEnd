/** Poll only a visible, online page, and never overlap requests from this poller. */
export function startVisiblePolling(callback, interval, env = {}) {
  const page = env.document ?? document;
  const host = env.window ?? window;
  const connection = env.navigator ?? navigator;
  let stopped = false;
  let pending = false;
  const tick = async () => {
    if (stopped || pending || page.visibilityState === 'hidden' || connection.onLine === false) return;
    pending = true;
    try { await callback(); } catch { /* The caller owns foreground error/session handling. */ }
    finally { pending = false; }
  };
  const timer = host.setInterval(tick, interval);
  page.addEventListener('visibilitychange', tick);
  host.addEventListener('online', tick);
  if (env.immediate) void tick();
  return () => {
    stopped = true;
    host.clearInterval(timer);
    page.removeEventListener('visibilitychange', tick);
    host.removeEventListener('online', tick);
  };
}
