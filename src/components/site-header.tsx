"use client";

import Image from "next/image";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { ContactRevealButton } from "@/components/microkit/contact-reveal-button";

const navigation = [
  { label: "Work", href: "#work", id: "work" },
  { label: "Services", href: "#services", id: "services" },
  { label: "Approach", href: "#approach", id: "approach" },
  { label: "About", href: "#about", id: "about" },
  { label: "Contact", href: "#contact", id: "contact" },
];

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  /* scroll state + active section ------------------------------------- */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 18);

      // The active section is the last one whose top has crossed ~35% of the viewport.
      const line = window.innerHeight * 0.35;
      let current = "";
      if (window.scrollY >= 160) {
        navigation.forEach(({ id }) => {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= line) current = id;
        });
      }
      setActiveSection(current);
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

  /* sliding indicator -------------------------------------------------- */
  const targetId = hovered ?? activeSection;
  const moveIndicator = useCallback(() => {
    const nav = desktopNavRef.current;
    if (!nav) return;
    const link = targetId ? linkRefs.current[targetId] : null;
    if (!link) {
      nav.style.setProperty("--ind-o", "0");
      return;
    }
    nav.style.setProperty("--ind-x", `${link.offsetLeft}px`);
    nav.style.setProperty("--ind-w", `${link.offsetWidth}px`);
    nav.style.setProperty("--ind-o", "1");
  }, [targetId]);

  useEffect(() => {
    moveIndicator();
    window.addEventListener("resize", moveIndicator);
    return () => window.removeEventListener("resize", moveIndicator);
  }, [moveIndicator]);

  /* mobile menu -------------------------------------------------------- */
  useEffect(() => {
    if (!menuOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      mobileNavRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 960) setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      root.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  /* theme toggle with a circular reveal from the button --------------- */
  const isDark = resolvedTheme !== "light";
  const nextTheme = isDark ? "light" : "dark";

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const doc = document as ViewTransitionDocument;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) {
      setTheme(nextTheme);
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => undefined);
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-menu-open" : ""}`}>
      <div className="header-inner">
        <a className="brand-link" href="#top" aria-label="Helyx IT home" data-magnetic="0.2">
          <Image className="brand-logo" src="/helyx-it-logo.png" alt="Helyx IT" width={740} height={310} priority />
        </a>

        <nav
          ref={desktopNavRef}
          className="desktop-navigation"
          aria-label="Main navigation"
          onPointerLeave={() => setHovered(null)}
        >
          <span className="nav-indicator" aria-hidden="true" />
          {navigation.map((item) => (
            <a
              key={item.id}
              ref={(node) => {
                linkRefs.current[item.id] = node;
              }}
              className={activeSection === item.id ? "is-active" : ""}
              href={item.href}
              aria-current={activeSection === item.id ? "location" : undefined}
              onPointerEnter={() => setHovered(item.id)}
              onFocus={() => setHovered(item.id)}
              onBlur={() => setHovered(null)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            onClick={toggleTheme}
            data-magnetic="0.35"
          >
            <Sun className="theme-icon theme-icon--sun" size={17} strokeWidth={1.6} />
            <Moon className="theme-icon theme-icon--moon" size={17} strokeWidth={1.6} />
          </button>
          <ContactRevealButton href="#contact" label="Start a project" className="header-contact-reveal" />
          <button
            ref={menuButtonRef}
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-site-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-toggle-bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div className="scroll-progress" aria-hidden="true" />

      <nav
        ref={mobileNavRef}
        className={`mobile-navigation${menuOpen ? " is-open" : ""}`}
        id="mobile-site-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        {navigation.map((item, index) => (
          <a
            key={item.id}
            className={activeSection === item.id ? "is-active" : ""}
            style={{ "--i": index } as CSSProperties}
            href={item.href}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <span>0{index + 1}</span>
            {item.label}
          </a>
        ))}
        <a
          className="mobile-navigation-cta"
          style={{ "--i": navigation.length } as CSSProperties}
          href="#contact"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
        >
          Start a project <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
