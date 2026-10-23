/**
 * Resilient read-only live updates for the NEXUS simulator.
 * Connection health is informational; it never authorizes machine commands.
 *
 * EventSource normally reconnects by itself. If it cannot deliver updates,
 * snapshots continue to refresh at a bounded interval until the stream returns.
 */
export function monitorMachineUpdates({
  connect,
  refresh,
  onStatus,
  clock = () => Date.now(),
  every = (fn, ms) => setInterval(fn, ms),
  stopEvery = (id) => clearInterval(id),
  intervalMs = 12_000,
  staleMs = 45_000,
}) {
  if (typeof refresh !== "function" || typeof onStatus !== "function") {
    throw new TypeError("refresh and onStatus callbacks are required");
  }
  if (!Number.isSafeInteger(intervalMs) || intervalMs < 1000 ||
      !Number.isSafeInteger(staleMs) || staleMs <= intervalMs) {
    throw new RangeError("Invalid stream health interval");
  }
  let cancelled = false;
  let source;
  let fallbackTimer = null;
  let currentStatus = null;
  let lastSignal = clock();

  function status(value) {
    if (cancelled || currentStatus === value) return;
    currentStatus = value;
    onStatus(value);
  }
  function refreshSafely() {
    if (!cancelled) refresh();
  }
  function startFallback() {
    if (cancelled) return;
    status("polling");
    if (fallbackTimer === null) {
      refreshSafely();
      fallbackTimer = every(refreshSafely, intervalMs);
    }
  }
  function stopFallback() {
    if (fallbackTimer !== null) {
      stopEvery(fallbackTimer);
      fallbackTimer = null;
    }
  }
  function connected() {
    if (cancelled) return;
    lastSignal = clock();
    stopFallback();
    if (currentStatus !== "live") {
      status("live");
      refreshSafely();
    }
  }

  status("connecting");
  // Also handles a stream that hangs without emitting its 'error' event.
  const healthTimer = every(() => {
    if (!cancelled && clock() - lastSignal >= staleMs) startFallback();
  }, intervalMs);

  try {
    source = connect("/api/machine/stream");
    if (!source || typeof source.addEventListener !== "function") {
      throw new Error("EventSource unavailable");
    }
    source.addEventListener("open", connected);
    source.addEventListener("ready", connected);
    source.addEventListener("heartbeat", connected);
    source.addEventListener("operations-update", () => {
      connected();
      refreshSafely();
    });
    source.addEventListener("error", startFallback);
  } catch {
    source?.close?.();
    startFallback();
  }

  return () => {
    if (cancelled) return;
    cancelled = true;
    stopFallback();
    stopEvery(healthTimer);
    source?.close?.();
  };
}
