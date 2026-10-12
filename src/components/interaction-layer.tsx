"use client";

import { useEffect, useRef } from "react";

/**
 * One small client component that powers the site-wide interaction language:
 *  - scroll progress (CSS var --scroll-progress)
 *  - scroll reveals for [data-reveal] (+ [data-stagger] parents)
 *  - pointer spotlight for [data-spotlight]
 *  - magnetic pull for [data-magnetic]
 *  - a custom cursor ring with labels ([data-cursor="Visit"])
 *  - a smoothed, viewport-normalised pointer (--gx / --gy, -1..1)
 *
 * Everything is progressive: touch devices and reduced-motion users get the
 * plain, fully visible page.
 */

const INTERACTIVE = "a[href], button, summary, [role='button'], label, select";
const TEXTUAL = "input:not([type='radio']):not([type='checkbox']), textarea";

export function InteractionLayer() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    /* ---------- scroll progress ---------- */
    let scrollFrame = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", max > 0 ? (window.scrollY / max).toFixed(4) : "0");
    };
    const scheduleScroll = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
    cleanups.push(() => {
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    });

    /* ---------- reveals ---------- */
    if (!reduce && "IntersectionObserver" in window) {
      document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((parent) => {
        parent
          .querySelectorAll<HTMLElement>(":scope > [data-reveal]")
          .forEach((child, index) => child.style.setProperty("--rd", String(index)));
      });

      const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      elements.forEach((el) => {
        if (el.dataset.revealDelay) el.style.setProperty("--rd", el.dataset.revealDelay);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // `top < 0` also reveals anything the user scrolled straight past.
            if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
      );

      elements.forEach((el) => {
        // Only arm what is below the fold, so the first screen never flickers.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        el.classList.add("reveal-armed");
        observer.observe(el);
      });
      cleanups.push(() => observer.disconnect());
    }

    /* ---------- pointer driven effects (mouse / pen only) ---------- */
    if (fine) {
      const cursor = cursorRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      const label = labelRef.current;
      const useCursor = !reduce && !!cursor && !!ring && !!dot && !!label;

      const pointer = { x: -100, y: -100, rx: -100, ry: -100, gx: 0, gy: 0, tgx: 0, tgy: 0 };
      let frame = 0;
      let activeMagnet: HTMLElement | null = null;
      let seen = false;

      const loop = () => {
        frame = 0;
        pointer.rx += (pointer.x - pointer.rx) * 0.2;
        pointer.ry += (pointer.y - pointer.ry) * 0.2;
        pointer.gx += (pointer.tgx - pointer.gx) * 0.08;
        pointer.gy += (pointer.tgy - pointer.gy) * 0.08;

        if (useCursor) {
          ring!.style.transform = `translate3d(${pointer.rx.toFixed(1)}px, ${pointer.ry.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
        root.style.setProperty("--gx", pointer.gx.toFixed(3));
        root.style.setProperty("--gy", pointer.gy.toFixed(3));

        const settling =
          Math.abs(pointer.x - pointer.rx) > 0.2 ||
          Math.abs(pointer.y - pointer.ry) > 0.2 ||
          Math.abs(pointer.tgx - pointer.gx) > 0.002 ||
          Math.abs(pointer.tgy - pointer.gy) > 0.002;
        if (settling) frame = window.requestAnimationFrame(loop);
      };
      const wake = () => {
        if (!frame) frame = window.requestAnimationFrame(loop);
      };

      const resetMagnet = (el: HTMLElement) => {
        el.style.setProperty("--mag-x", "0px");
        el.style.setProperty("--mag-y", "0px");
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const target = event.target as Element | null;
        if (!target || !target.closest) return;

        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.tgx = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.tgy = (event.clientY / window.innerHeight) * 2 - 1;

        if (useCursor) {
          if (!seen) {
            seen = true;
            pointer.rx = pointer.x;
            pointer.ry = pointer.y;
            cursor!.dataset.visible = "true";
          }
          dot!.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

          const labelled = target.closest<HTMLElement>("[data-cursor]");
          let mode = "idle";
          if (labelled) {
            mode = "label";
            if (label!.textContent !== labelled.dataset.cursor) label!.textContent = labelled.dataset.cursor ?? "";
          } else if (target.closest(TEXTUAL)) {
            mode = "text";
          } else if (target.closest(INTERACTIVE)) {
            mode = "link";
          }
          if (cursor!.dataset.mode !== mode) cursor!.dataset.mode = mode;
        }

        const spot = target.closest<HTMLElement>("[data-spotlight]");
        if (spot) {
          const box = spot.getBoundingClientRect();
          spot.style.setProperty("--sx", `${(event.clientX - box.left).toFixed(0)}px`);
          spot.style.setProperty("--sy", `${(event.clientY - box.top).toFixed(0)}px`);
        }

        const magnet = target.closest<HTMLElement>("[data-magnetic]");
        if (activeMagnet && activeMagnet !== magnet) resetMagnet(activeMagnet);
        activeMagnet = magnet;
        if (magnet && !reduce) {
          const box = magnet.getBoundingClientRect();
          const strength = Number(magnet.dataset.magnetic) || 0.3;
          const dx = event.clientX - (box.left + box.width / 2);
          const dy = event.clientY - (box.top + box.height / 2);
          magnet.style.setProperty("--mag-x", `${(dx * strength).toFixed(1)}px`);
          magnet.style.setProperty("--mag-y", `${(dy * strength).toFixed(1)}px`);
        }

        wake();
      };

      const onDown = () => {
        if (cursor) cursor.dataset.down = "true";
      };
      const onUp = () => {
        if (cursor) delete cursor.dataset.down;
      };
      const onLeave = (event: MouseEvent) => {
        if (event.relatedTarget) return;
        if (cursor) delete cursor.dataset.visible;
        seen = false;
        if (activeMagnet) resetMagnet(activeMagnet);
        activeMagnet = null;
      };

      if (useCursor) root.classList.add("has-cursor");
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.addEventListener("mouseout", onLeave);

      cleanups.push(() => {
        root.classList.remove("has-cursor");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        document.removeEventListener("mouseout", onLeave);
        if (frame) window.cancelAnimationFrame(frame);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="cursor" ref={cursorRef} aria-hidden="true">
      <span className="cursor-ring" ref={ringRef}>
        <span className="cursor-label" ref={labelRef} />
      </span>
      <span className="cursor-dot" ref={dotRef} />
    </div>
  );
}
