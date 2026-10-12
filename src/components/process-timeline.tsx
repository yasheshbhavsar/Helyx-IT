"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

const processSteps = [
  { number: "01", title: "Discover", description: "Understand your business, audience, constraints and objectives." },
  { number: "02", title: "Design", description: "Define the experience, structure, visual language and interactions." },
  { number: "03", title: "Build", description: "Develop with care for responsiveness, maintainability and performance." },
  { number: "04", title: "Refine", description: "Test, improve, launch and iterate around real requirements." },
];

export function ProcessTimeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const scrollIndex = useRef(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeStep, setActiveStep] = useState(0);

  // Scrolling moves the active step; clicking, hovering or the keyboard can
  // take over until the scroll position crosses into another step.
  useEffect(() => {
    const list = listRef.current;
    const section = list?.closest<HTMLElement>(".approach-section");
    if (!section) return;

    let frame: number | null = null;
    const update = () => {
      frame = null;
      const bounds = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (bounds.height + window.innerHeight)));
      const index = Math.min(processSteps.length - 1, Math.floor(progress * processSteps.length));
      if (index !== scrollIndex.current) {
        scrollIndex.current = index;
        setActiveStep(index);
      }
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = processSteps.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? Math.min(last, index + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? Math.max(0, index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActiveStep(next);
    buttons.current[next]?.focus();
  };

  const listStyle = { "--process-count": processSteps.length } as CSSProperties;

  return (
    <>
      <ol className="process-list" ref={listRef} style={listStyle} data-stagger>
        {processSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;
          return (
            <li
              className={`process-step${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              key={step.number}
              data-reveal
              data-spotlight
              aria-current={isActive ? "step" : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActiveStep(index);
              }}
              onClick={() => setActiveStep(index)}
            >
              <div className="process-step-top">
                <button
                  ref={(node) => {
                    buttons.current[index] = node;
                  }}
                  className="process-step-button"
                  type="button"
                  aria-label={`Step ${step.number}: ${step.title}`}
                  aria-pressed={isActive}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onClick={() => setActiveStep(index)}
                >
                  {step.number}
                </button>
                <span className="process-line" aria-hidden="true" />
                <span className="process-dot" aria-hidden="true" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          );
        })}
      </ol>
      <div className="process-caption"><span>ONE SHARED DIRECTION</span><span>FOUR DELIBERATE STEPS</span></div>
    </>
  );
}
