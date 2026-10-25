import { describe, expect, it, vi } from "vitest";
import {
  clampSidebarWidth,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  persistSidebarWidth,
  readSidebarWidth,
  sidebarWidthForKey,
} from "./sidebarWidth";

describe("keyboard-accessible sidebar width", () => {
  it("clamps corrupt, out-of-range and nonfinite persisted values", () => {
    expect(clampSidebarWidth(null)).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("")).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("not-a-number")).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("Infinity")).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("-999")).toBe(MIN_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("9999")).toBe(MAX_SIDEBAR_WIDTH);
    expect(clampSidebarWidth("300.6")).toBe(301);
  });

  it("loads defaults safely when browser storage is unavailable", () => {
    expect(readSidebarWidth(() => { throw new Error("storage denied"); })).toBe(DEFAULT_SIDEBAR_WIDTH);
    expect(readSidebarWidth(() => "340")).toBe(340);
  });

  it("does not crash or claim persistence when writing is blocked", () => {
    expect(persistSidebarWidth(() => { throw new Error("quota"); }, 300)).toBe(false);
    const write = vi.fn();
    expect(persistSidebarWidth(write, 999)).toBe(true);
    expect(write).toHaveBeenCalledWith(String(MAX_SIDEBAR_WIDTH));
  });

  it("supports arrows, Home and End without intercepting other keys", () => {
    expect(sidebarWidthForKey("ArrowLeft", 300)).toBe(290);
    expect(sidebarWidthForKey("ArrowRight", 300)).toBe(310);
    expect(sidebarWidthForKey("Home", 300)).toBe(MIN_SIDEBAR_WIDTH);
    expect(sidebarWidthForKey("End", 300)).toBe(MAX_SIDEBAR_WIDTH);
    expect(sidebarWidthForKey("ArrowLeft", MIN_SIDEBAR_WIDTH)).toBe(MIN_SIDEBAR_WIDTH);
    expect(sidebarWidthForKey("Tab", 300)).toBeNull();
  });
});
