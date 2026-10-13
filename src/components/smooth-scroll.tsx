"use client";

import { useEffect } from "react";

/**
 * Enhances scroll behavior with smooth momentum and easing
 * Adds parallax effects to hero elements
 */
export function SmoothScroll() {
  useEffect(() => {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.scrollY;
      const vh = window.innerHeight;

      // Hero parallax progress (0 to 1 over first viewport)
      const heroProgress = Math.min(scrolled / vh, 1);

      // Update CSS variable for hero parallax
      document.documentElement.style.setProperty('--hero-p', heroProgress.toFixed(3));

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Initialize
    updateParallax();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateParallax);
    };
  }, []);

  return null;
}
