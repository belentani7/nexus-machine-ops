/** Observed simulator snapshots only: never synthesize historical telemetry. */
export type TelemetryReading = {
  machineId: string;
  capturedAt: number;
  temperature: number;
  power: number;
};

export type TelemetryPoint = TelemetryReading & { point: string };

export function appendTelemetryReading(
  history: TelemetryPoint[],
  reading: TelemetryReading,
  limit = 30,
): TelemetryPoint[] {
  if (
    !reading.machineId ||
    !Number.isSafeInteger(reading.capturedAt) || reading.capturedAt <= 0 ||
    !Number.isFinite(reading.temperature) || !Number.isFinite(reading.power) ||
    !Number.isSafeInteger(limit) || limit < 1
  ) return history;

  const last = history.at(-1);
  if (last?.machineId === reading.machineId && reading.capturedAt <= last.capturedAt) {
    return history;
  }
  const previous = last?.machineId === reading.machineId ? history : [];
  return [...previous, {
    ...reading,
    point: new Date(reading.capturedAt).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
  }].slice(-limit);
}
