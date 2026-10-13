"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide interaction language:
 *  - scroll progress (CSS var --scroll-progress)
 *  - scroll reveals for [data-reveal] (+ [data-stagger] parents)
 *  - pointer spotlight for [data-spotlight]
 *  - magnetic pull for [data-magnetic]
 *  - custom cursor with mix-blend-mode (scale: 0.3 default dot, scale: 1 on interactive hover)
 *  - smoothed, viewport-normalised pointer (--gx / --gy, -1..1)
 */

const INTERACTIVE = "a[href], button, summary, [role='button'], label, select, input[type='submit'], input[type='button']";
const TEXTUAL = "input:not([type='radio']):not([type='checkbox']):not([type='submit']):not([type='button']), textarea";

export function InteractionLayer() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
            if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
      );

      elements.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        el.classList.add("reveal-armed");
        observer.observe(el);
      });
      cleanups.push(() => observer.disconnect());
    }

    /* ---------- pointer driven effects ---------- */
    const cursor = cursorRef.current;
    const label = labelRef.current;
    let activeMagnet: HTMLElement | null = null;
    let isCursorInited = false;

    // Smoothed pointer for 3D spatial & tilt effects (--gx / --gy)
    const pointer = { gx: 0, gy: 0, tgx: 0, tgy: 0 };
    let tiltFrame = 0;
    const tiltLoop = () => {
      tiltFrame = 0;
      pointer.gx += (pointer.tgx - pointer.gx) * 0.08;
      pointer.gy += (pointer.tgy - pointer.gy) * 0.08;
      root.style.setProperty("--gx", pointer.gx.toFixed(3));
      root.style.setProperty("--gy", pointer.gy.toFixed(3));

      if (Math.abs(pointer.tgx - pointer.gx) > 0.001 || Math.abs(pointer.tgy - pointer.gy) > 0.001) {
        tiltFrame = window.requestAnimationFrame(tiltLoop);
      }
    };
    const wakeTilt = () => {
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(tiltLoop);
    };

    const resetMagnet = (el: HTMLElement) => {
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
    };

    const initCursor = () => {
      if (cursor) {
        cursor.classList.add("custom-cursor--init");
      }
      root.classList.add("has-cursor");
      isCursorInited = true;
    };

    const destroyCursor = () => {
      if (cursor) {
        cursor.classList.remove("custom-cursor--init");
      }
      isCursorInited = false;
      if (activeMagnet) resetMagnet(activeMagnet);
      activeMagnet = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      if (!isCursorInited) {
        initCursor();
      }

      if (cursor) {
        // Direct translate positioning matching the zip
        cursor.style.translate = `${mouseX}px ${mouseY}px`;

        const target = event.target as Element | null;
        if (target && typeof target.closest === "function") {
          const labelled = target.closest<HTMLElement>("[data-cursor]");
          const isInteractive = !!target.closest(INTERACTIVE);
          const isTextual = !!target.closest(TEXTUAL);

          if (labelled) {
            cursor.classList.add("custom-cursor--label");
            cursor.classList.remove("custom-cursor--link", "custom-cursor--text");
            if (label && label.textContent !== labelled.dataset.cursor) {
              label.textContent = labelled.dataset.cursor ?? "";
            }
          } else if (isTextual) {
            cursor.classList.add("custom-cursor--text");
            cursor.classList.remove("custom-cursor--link", "custom-cursor--label");
          } else if (isInteractive) {
            cursor.classList.add("custom-cursor--link");
            cursor.classList.remove("custom-cursor--label", "custom-cursor--text");
          } else {
            cursor.classList.remove("custom-cursor--link", "custom-cursor--label", "custom-cursor--text");
          }

          // Spotlight effect
          const spot = target.closest<HTMLElement>("[data-spotlight]");
          if (spot) {
            const box = spot.getBoundingClientRect();
            spot.style.setProperty("--sx", `${(mouseX - box.left).toFixed(0)}px`);
            spot.style.setProperty("--sy", `${(mouseY - box.top).toFixed(0)}px`);
          }

          // Magnetic pull
          const magnet = target.closest<HTMLElement>("[data-magnetic]");
          if (activeMagnet && activeMagnet !== magnet) resetMagnet(activeMagnet);
          activeMagnet = magnet;
          if (magnet && !reduce) {
            const box = magnet.getBoundingClientRect();
            const strength = Number(magnet.dataset.magnetic) || 0.3;
            const dx = mouseX - (box.left + box.width / 2);
            const dy = mouseY - (box.top + box.height / 2);
            magnet.style.setProperty("--mag-x", `${(dx * strength).toFixed(1)}px`);
            magnet.style.setProperty("--mag-y", `${(dy * strength).toFixed(1)}px`);
          }
        }
      }

      // Update spatial coordinates
      pointer.tgx = (mouseX / window.innerWidth) * 2 - 1;
      pointer.tgy = (mouseY / window.innerHeight) * 2 - 1;
      wakeTilt();
    };

    const onDown = () => {
      if (cursor) cursor.classList.add("custom-cursor--down");
    };

    const onUp = () => {
      if (cursor) cursor.classList.remove("custom-cursor--down");
    };

    const onLeave = (event: MouseEvent | PointerEvent) => {
      if ("relatedTarget" in event && event.relatedTarget) return;
      destroyCursor();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    cleanups.push(() => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="custom-cursor" ref={cursorRef} aria-hidden="true">
      <span className="cursor-label" ref={labelRef} />
    </div>
  );
}
