export type MachineStreamStatus = "connecting" | "live" | "polling";
export interface MachineUpdateSource {
  addEventListener(type: "open" | "ready" | "heartbeat" | "operations-update" | "error", listener: () => void): void;
  close(): void;
}
export interface MachineUpdateMonitorOptions {
  connect: (url: string) => MachineUpdateSource;
  refresh: () => void;
  onStatus: (status: MachineStreamStatus) => void;
  clock?: () => number;
  every?: (fn: () => void, milliseconds: number) => ReturnType<typeof setInterval>;
  stopEvery?: (id: ReturnType<typeof setInterval>) => void;
  intervalMs?: number;
  staleMs?: number;
}
export function monitorMachineUpdates(options: MachineUpdateMonitorOptions): () => void;
