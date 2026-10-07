import { useLayoutEffect, useRef, useState } from 'react';

/** Measures the wrapping element's CSS width so the SVG viewBox matches its
 *  rendered pixel width — chart text then renders at its CSS font size.
 *  Falls back to `fallback` (640) when no layout exists (jsdom). */
export function useChartWidth(fallback = 640) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth > 0 ? el.clientWidth : fallback);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return { ref, width };
}
