import { useEffect, useRef, useState } from "react";
import { monitorMachineUpdates, type MachineStreamStatus } from "../lib/machineUpdates.mjs";

/** Read-only simulated-operation updates with reconnection and a bounded fallback. */
export function useMachineUpdates(enabled: boolean, refresh: () => void) {
  const callback = useRef(refresh);
  callback.current = refresh;
  const [state, setState] = useState<MachineStreamStatus>("connecting");

  useEffect(() => {
    if (!enabled) return;
    return monitorMachineUpdates({
      connect: (url) => new EventSource(url),
      refresh: () => callback.current(),
      onStatus: setState,
    });
  }, [enabled]);

  return enabled ? state : "offline";
}
