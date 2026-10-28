import { describe, expect, it } from "vitest";
import { appendTelemetryReading } from "./telemetryHistory";

const reading = (capturedAt: number, machineId = "SIM-1") => ({
  machineId, capturedAt, temperature: 36, power: 4.5,
});

describe("observed simulator telemetry", () => {
  it("starts with one real sample instead of fabricating earlier points", () => {
    const result = appendTelemetryReading([], reading(1_000));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(reading(1_000));
  });

  it("does not duplicate or reorder cached and stale snapshots", () => {
    const first = appendTelemetryReading([], reading(1_000));
    expect(appendTelemetryReading(first, reading(1_000))).toBe(first);
    expect(appendTelemetryReading(first, reading(999))).toBe(first);
  });

  it("keeps a bounded series of actual readings", () => {
    let history = appendTelemetryReading([], reading(1_000));
    for (let index = 1; index < 40; index++) {
      history = appendTelemetryReading(history, reading(1_000 + index * 1_000));
    }
    expect(history).toHaveLength(30);
    expect(history[0].capturedAt).toBe(11_000);
    expect(history.at(-1)?.capturedAt).toBe(40_000);
  });

  it("resets the chart on machine change, never mixing independent telemetry", () => {
    const old = appendTelemetryReading([], reading(1_000));
    const next = appendTelemetryReading(old, reading(2_000, "SIM-2"));
    expect(next).toHaveLength(1);
    expect(next[0].machineId).toBe("SIM-2");
  });

  it("rejects invalid samples without modifying prior readings", () => {
    const old = appendTelemetryReading([], reading(1_000));
    expect(appendTelemetryReading(old, { ...reading(2_000), temperature: NaN })).toBe(old);
    expect(appendTelemetryReading(old, { ...reading(2_000), power: Infinity })).toBe(old);
    expect(appendTelemetryReading(old, reading(0))).toBe(old);
    expect(appendTelemetryReading(old, reading(2_000), 0)).toBe(old);
  });
});
