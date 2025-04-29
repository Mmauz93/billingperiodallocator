import { useEffect, useState } from "react";

/**
 * Custom hook to determine if parallax effects should be enabled based on
 * reduced motion preference and viewport width.
 */
export function useParallaxSafety(): boolean {
  const [shouldEnableParallax, setShouldEnableParallax] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return; // Don't run on server
    }

    const checkParallaxConditions = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Check for viewport size (lg breakpoint: 1024px)
      const isLargeViewport = window.innerWidth >= 1024;

      // Only enable if both conditions are met
      setShouldEnableParallax(!prefersReducedMotion && isLargeViewport);
    };

    // Initial check
    checkParallaxConditions();

    // Listen for changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const resizeObserver = new ResizeObserver(checkParallaxConditions);

    reducedMotionQuery.addEventListener("change", checkParallaxConditions);
    resizeObserver.observe(document.body);

    return () => {
      reducedMotionQuery.removeEventListener("change", checkParallaxConditions);
      resizeObserver.disconnect();
    };
  }, []);

  return shouldEnableParallax;
}
