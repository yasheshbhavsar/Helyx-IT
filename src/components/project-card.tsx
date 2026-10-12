"use client";

import Image from "next/image";
import { MoveUpRight } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import type { Project } from "@/lib/projects";
import { SignatureX } from "@/components/signature-x";
import { ProjectsArrowButton } from "@/components/microkit/projects-arrow-button";

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
  total?: number;
};

const MAX_TILT = 7;

export function ProjectCard({ project, featured = false, total = 3 }: ProjectCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const motion = useRef({
    targetX: 0, targetY: 0, currentX: 0, currentY: 0,
    targetLightX: 50, targetLightY: 50, currentLightX: 50, currentLightY: 50,
    hover: 0, currentHover: 0,
  });

  useEffect(() => () => {
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
  }, []);

  const animateFrame = () => {
    const frame = frameRef.current;
    if (!frame) {
      animationRef.current = null;
      return;
    }

    const s = motion.current;
    s.currentX += (s.targetX - s.currentX) * 0.12;
    s.currentY += (s.targetY - s.currentY) * 0.12;
    s.currentLightX += (s.targetLightX - s.currentLightX) * 0.2;
    s.currentLightY += (s.targetLightY - s.currentLightY) * 0.2;
    s.currentHover += (s.hover - s.currentHover) * 0.14;

    frame.style.setProperty("--rx", s.currentX.toFixed(3));
    frame.style.setProperty("--ry", s.currentY.toFixed(3));
    frame.style.setProperty("--light-x", `${s.currentLightX.toFixed(1)}%`);
    frame.style.setProperty("--light-y", `${s.currentLightY.toFixed(1)}%`);
    frame.style.setProperty("--lift", s.currentHover.toFixed(3));

    const settling =
      Math.abs(s.targetX - s.currentX) > 0.01 ||
      Math.abs(s.targetY - s.currentY) > 0.01 ||
      Math.abs(s.targetLightX - s.currentLightX) > 0.2 ||
      Math.abs(s.targetLightY - s.currentLightY) > 0.2 ||
      Math.abs(s.hover - s.currentHover) > 0.005;
    animationRef.current = settling ? window.requestAnimationFrame(animateFrame) : null;
  };

  const schedule = () => {
    if (animationRef.current === null) animationRef.current = window.requestAnimationFrame(animateFrame);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const s = motion.current;
    s.targetX = (0.5 - y) * 2 * MAX_TILT;
    s.targetY = (x - 0.5) * 2 * MAX_TILT;
    s.targetLightX = x * 100;
    s.targetLightY = y * 100;
    s.hover = 1;
    schedule();
  };

  const resetPointer = () => {
    const s = motion.current;
    s.targetX = 0;
    s.targetY = 0;
    s.targetLightX = 50;
    s.targetLightY = 50;
    s.hover = 0;
    schedule();
  };

  return (
    <article className={`project-card${featured ? " project-card--featured" : ""}`} data-reveal>
      <div className="project-stage" ref={stageRef} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
        <div className="project-visual-frame" ref={frameRef}>
          <div className="browser-chrome" aria-hidden="true">
            <span className="browser-lights"><i /><i /><i /></span>
            <span className="browser-address">{project.domain}</span>
            <span className="browser-arrow"><MoveUpRight size={13} strokeWidth={1.5} /></span>
          </div>
          <div className={`project-artwork project-artwork--${project.id}`}>
            <Image
              className="project-image"
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 860px) 100vw, (max-width: 1280px) 58vw, 830px"
            />
            <span className="project-glare" aria-hidden="true" />
          </div>
          {featured && <SignatureX className="signature-x--project" />}
          <span className="project-frame-number" aria-hidden="true">{project.number} / {String(total).padStart(2, "0")}</span>
        </div>
        <a
          className="project-visual-link"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden="true"
          data-cursor="Visit"
        />
      </div>

      <div className="project-copy">
        <div className="project-heading-row">
          <div>
            <p className="eyebrow project-category">{project.category}</p>
            <h3>{project.name}</h3>
          </div>
          <ProjectsArrowButton
            href={project.url}
            label="Visit website"
            external
            ariaLabel={`Visit ${project.name} website, opens in a new tab`}
          />
        </div>
        <p className="project-description">{project.description}</p>
        <ul className="project-capabilities" aria-label={`${project.name} capabilities`}>
          {project.capabilities.map((capability) => <li key={capability}>{capability}</li>)}
        </ul>
      </div>
    </article>
  );
}
