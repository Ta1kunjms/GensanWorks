import { useEffect } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Scales the entire app proportionally (no layout changes) so the desktop layout
 * fits within the current viewport width without horizontal scrolling.
 *
 * Strategy:
 * - Prefer CSS `zoom` (scales portals/tooltips too in Chromium-based browsers)
 * - Fallback to `transform: scale()` on #root when zoom is unsupported
 */
export function useScaleToFitViewportWidth(options?: {
  /** Minimum scale allowed (prevents going too tiny). */
  minScale?: number;
}) {
  const minScale = options?.minScale ?? 0.1;

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    const supportsZoom =
      typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("zoom", "1");

    const apply = () => {
      // Always prevent horizontal scrolling at the top level.
      document.documentElement.style.overflowX = "hidden";
      document.body.style.overflowX = "hidden";

      // Reset scaling before measuring.
      if (supportsZoom) {
        document.body.style.zoom = "1";
      }
      document.body.style.transform = "";
      document.body.style.transformOrigin = "";
      root.style.transform = "";
      root.style.transformOrigin = "";

      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const contentWidth = root.scrollWidth || Math.ceil(root.getBoundingClientRect().width);

      if (!contentWidth || !viewportWidth) return;

      const rawScale = Math.min(1, viewportWidth / contentWidth);
      const scale = clamp(rawScale, minScale, 1);

      if (supportsZoom) {
        document.body.style.zoom = String(scale);
        document.body.style.transform = "";
        document.body.style.transformOrigin = "";
      } else {
        // Transform fallback scales EVERYTHING in <body> including portal content.
        document.body.style.transformOrigin = "top left";
        document.body.style.transform = `scale(${scale})`;
      }
    };

    const scheduleApply = () => {
      // Avoid multiple sync layouts during resize bursts.
      window.requestAnimationFrame(apply);
    };

    const resizeObserver = new ResizeObserver(scheduleApply);
    resizeObserver.observe(root);

    window.addEventListener("resize", scheduleApply, { passive: true });
    window.addEventListener("orientationchange", scheduleApply);

    apply();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleApply);
      window.removeEventListener("orientationchange", scheduleApply);
    };
  }, [minScale]);
}
