/** Sidebar resizing stays usable even when storage is blocked or corrupt. */
export const SIDEBAR_WIDTH_KEY = "sidebar-width";
export const DEFAULT_SIDEBAR_WIDTH = 280;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 480;

export function clampSidebarWidth(value: unknown): number {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(parsed)
    ? Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(parsed)))
    : DEFAULT_SIDEBAR_WIDTH;
}

export function readSidebarWidth(read: () => string | null): number {
  try {
    return clampSidebarWidth(read());
  } catch {
    return DEFAULT_SIDEBAR_WIDTH;
  }
}

export function persistSidebarWidth(write: (value: string) => void, width: number): boolean {
  try {
    write(String(clampSidebarWidth(width)));
    return true;
  } catch {
    return false;
  }
}

export function sidebarWidthForKey(key: string, current: number): number | null {
  const width = clampSidebarWidth(current);
  if (key === "Home") return MIN_SIDEBAR_WIDTH;
  if (key === "End") return MAX_SIDEBAR_WIDTH;
  if (key === "ArrowLeft") return clampSidebarWidth(width - 10);
  if (key === "ArrowRight") return clampSidebarWidth(width + 10);
  return null;
}
