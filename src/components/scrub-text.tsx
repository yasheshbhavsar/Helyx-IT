"use client";

import { useEffect, useRef } from "react";

type ScrubLine = { text: string; className?: string };

type ScrubTextProps = {
  lines: ScrubLine[];
  id?: string;
  className?: string;
};

/**
 * A heading whose words light up one by one as it scrolls through the
 * viewport. Without JS (or with reduced motion) every word is fully visible.
 */
export function ScrubText({ lines, id, className = "" }: ScrubTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".scrub-word"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.armed = "true";
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh * 0.9 - box.top) / (vh * 0.5 + box.height * 0.6);
      const progress = Math.min(1, Math.max(0, raw));
      const span = words.length + 2;
      words.forEach((word, index) => {
        const t = Math.min(1, Math.max(0, progress * span - index));
        word.style.setProperty("--lit", t.toFixed(3));
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <h2 ref={ref} id={id} className={`scrub-text ${className}`.trim()}>
      {lines.map((line) => (
        <span className={`scrub-line ${line.className ?? ""}`.trim()} key={line.text}>
          {line.text.split(" ").map((word, index) => (
            <span key={`${word}-${index}`}>
              <span className="scrub-word">{word}</span>{" "}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
