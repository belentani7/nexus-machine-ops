import { describe, expect, it, vi } from "vitest";
import { monitorMachineUpdates } from "./machineUpdates.mjs";

function fixture() {
  const listeners = new Map();
  const timers = new Map();
  const source = {
    closed: false,
    addEventListener(type, callback) { listeners.set(type, callback); },
    close() { this.closed = true; },
    emit(type) { listeners.get(type)?.(); },
  };
  let now = 0;
  let nextTimer = 0;
  const refresh = vi.fn();
  const onStatus = vi.fn();
  const monitor = (connect = () => source) => monitorMachineUpdates({
    connect, refresh, onStatus,
    clock: () => now,
    every: (fn, ms) => { const id = ++nextTimer; timers.set(id, { fn, ms }); return id; },
    stopEvery: (id) => { timers.delete(id); },
    intervalMs: 12_000,
    staleMs: 45_000,
  });
  return {
    source, timers, refresh, onStatus, monitor,
    advance(ms) { now += ms; [...timers.values()].forEach(task => task.fn()); },
  };
}

describe("NEXUS simulation SSE resiliency", () => {
  it("opens a read-only simulation stream and refreshes live changes", () => {
    const f = fixture();
    const stop = f.monitor();
    expect(f.onStatus).toHaveBeenCalledWith("connecting");
    f.source.emit("open");
    expect(f.onStatus).toHaveBeenLastCalledWith("live");
    expect(f.refresh).toHaveBeenCalledTimes(1);
    f.source.emit("ready");
    expect(f.refresh).toHaveBeenCalledTimes(1);
    f.source.emit("operations-update");
    expect(f.refresh).toHaveBeenCalledTimes(2);
    stop();
    expect(f.source.closed).toBe(true);
    expect(f.timers.size).toBe(0);
  });

  it("falls back to bounded polling and stops the fallback when SSE reconnects", () => {
    const f = fixture();
    const stop = f.monitor();
    f.source.emit("error");
    expect(f.onStatus).toHaveBeenLastCalledWith("polling");
    expect(f.timers.size).toBe(2);
    expect(f.refresh).toHaveBeenCalledTimes(1);
    f.advance(12_000);
    expect(f.refresh).toHaveBeenCalledTimes(2);
    f.source.emit("ready");
    expect(f.onStatus).toHaveBeenLastCalledWith("live");
    expect(f.timers.size).toBe(1);
    expect(f.refresh).toHaveBeenCalledTimes(3);
    stop();
  });

  it("refreshes only once when the first post-reconnect signal is an update", () => {
    const f = fixture();
    const stop = f.monitor();
    f.source.emit("open");
    expect(f.refresh).toHaveBeenCalledTimes(1);
    f.source.emit("error");
    expect(f.refresh).toHaveBeenCalledTimes(2);
    f.source.emit("operations-update");
    expect(f.onStatus).toHaveBeenLastCalledWith("live");
    expect(f.refresh).toHaveBeenCalledTimes(3);
    f.source.emit("operations-update");
    expect(f.refresh).toHaveBeenCalledTimes(4);
    stop();
  });

  it("detects a silent connection and recovers on heartbeat", () => {
    const f = fixture();
    const stop = f.monitor();
    f.advance(46_000);
    expect(f.onStatus).toHaveBeenLastCalledWith("polling");
    f.source.emit("heartbeat");
    expect(f.onStatus).toHaveBeenLastCalledWith("live");
    expect(f.timers.size).toBe(1);
    stop();
  });

  it("uses polling if EventSource is unavailable and never refreshes after unmount", () => {
    const f = fixture();
    const stop = f.monitor(() => { throw new Error("no eventsource"); });
    expect(f.onStatus).toHaveBeenLastCalledWith("polling");
    expect(f.refresh).toHaveBeenCalledTimes(1);
    stop();
    f.advance(60_000);
    expect(f.refresh).toHaveBeenCalledTimes(1);
    expect(f.timers.size).toBe(0);
    stop();
  });

  it("ignores callbacks fired by old sources after cleanup", () => {
    const f = fixture();
    const stop = f.monitor();
    f.source.emit("open");
    stop();
    f.source.emit("operations-update");
    f.source.emit("error");
    expect(f.refresh).toHaveBeenCalledTimes(1);
  });

  it("rejects unsafe timer parameters without starting a stream", () => {
    expect(() => monitorMachineUpdates({
      connect: () => { throw Error("should not run"); },
      refresh: () => {},
      onStatus: () => {},
      intervalMs: 0,
    })).toThrow(RangeError);
  });
});
