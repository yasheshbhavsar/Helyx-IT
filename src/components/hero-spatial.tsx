"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Vec = { x: number; y: number; z: number };

const POINT_COUNT = 420;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
function buildSphere(count: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
}

/** Connect every point to its nearest neighbours, once. */
function buildEdges(points: Vec[], neighbours = 3, maxDist = 0.34): Array<[number, number]> {
  const seen = new Set<number>();
  const edges: Array<[number, number]> = [];
  points.forEach((a, i) => {
    const nearest = points
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 }))
      .filter(({ j, d }) => j !== i && d < maxDist * maxDist)
      .sort((p, q) => p.d - q.d)
      .slice(0, neighbours);
    nearest.forEach(({ j }) => {
      const key = i < j ? i * 10000 + j : j * 10000 + i;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([i, j]);
    });
  });
  return edges;
}

/** A tilted orbit ring made of short segments. */
function buildRing(tiltX: number, tiltZ: number, scale: number, segments = 120): Vec[] {
  const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
  const cz = Math.cos(tiltZ), sz = Math.sin(tiltZ);
  return Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    let x = Math.cos(a) * scale;
    let y = 0;
    let z = Math.sin(a) * scale;
    const y1 = y * cx - z * sx;
    z = y * sx + z * cx;
    y = y1;
    const x1 = x * cz - y * sz;
    y = x * sz + y * cz;
    x = x1;
    return { x, y, z };
  });
}

function readRgb(name: string, fallback: [number, number, number]): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/\s+/).map(Number);
  return parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? [parts[0], parts[1], parts[2]] : fallback;
}

export function HeroSpatial() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const hero = stage?.closest<HTMLElement>(".hero-section");
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !hero || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = buildSphere(POINT_COUNT);
    const edges = buildEdges(points);
    const rings = [
      { pts: buildRing(0.5, 0.35, 1.22), speed: 1 },
      { pts: buildRing(-0.9, -0.25, 1.42), speed: -0.6 },
      { pts: buildRing(1.25, 0.9, 1.06), speed: 0.8 },
    ];

    let fg: [number, number, number] = [245, 245, 243];
    let glow: [number, number, number] = [160, 190, 255];
    const readTheme = () => {
      fg = readRgb("--fg-rgb", fg);
      glow = readRgb("--glow", glow);
    };
    readTheme();
    const themeObserver = new MutationObserver(() => {
      readTheme();
      if (reduce) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const box = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(0);
    };

    // pointer / scroll state ------------------------------------------------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false, cx: -9999, cy: -9999 };
    let heroProgress = 0;
    let yawOffset = 0;
    let pitchOffset = 0;
    let lastHud = "";

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = hero.getBoundingClientRect();
      pointer.tx = clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1);
      pointer.ty = clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1);
      const stageBox = stage.getBoundingClientRect();
      pointer.cx = event.clientX - stageBox.left;
      pointer.cy = event.clientY - stageBox.top;
      pointer.inside = event.clientY >= box.top && event.clientY <= box.bottom;
    };
    const onPointerLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
      pointer.inside = false;
    };

    // drawing ---------------------------------------------------------------
    const px = new Float32Array(points.length);
    const py = new Float32Array(points.length);
    const pz = new Float32Array(points.length);
    const ps = new Float32Array(points.length);

    function draw(time: number) {
      const radius = Math.min(width, height) * 0.34;
      const cx = width / 2;
      const cy = height / 2;
      const yaw = time * 0.00014 + yawOffset + heroProgress * 1.6;
      const pitch = 0.32 + pitchOffset - heroProgress * 0.4;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
      const FOCAL = 3.2;

      const project = (v: Vec, extraYaw: number, outIndex: number) => {
        const cy2 = extraYaw ? Math.cos(yaw + extraYaw) : cosY;
        const sy2 = extraYaw ? Math.sin(yaw + extraYaw) : sinY;
        const x1 = v.x * cy2 + v.z * sy2;
        const z1 = -v.x * sy2 + v.z * cy2;
        const y1 = v.y * cosP - z1 * sinP;
        const z2 = v.y * sinP + z1 * cosP;
        const scale = FOCAL / (FOCAL - z2);
        px[outIndex] = cx + x1 * radius * scale;
        py[outIndex] = cy + y1 * radius * scale;
        pz[outIndex] = z2;
        ps[outIndex] = scale;
      };

      ctx!.clearRect(0, 0, width, height);
      points.forEach((p, i) => project(p, 0, i));

      const [fr, fgc, fb] = fg;
      const [gr, gg, gb] = glow;
      const hoverRadius = Math.max(90, radius * 0.38);
      const mx = pointer.cx;
      const my = pointer.cy;

      // ring orbits
      rings.forEach((ring, ringIndex) => {
        const spin = time * 0.00009 * ring.speed;
        ctx!.lineWidth = 1;
        let prevX = 0, prevY = 0, prevZ = 0;
        ring.pts.forEach((v, i) => {
          const c = Math.cos(spin), s = Math.sin(spin);
          const rv = { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
          const idx = 0;
          project(rv, 0, idx);
          const x = px[idx], y = py[idx], z = pz[idx];
          if (i > 0) {
            const depth = (z + prevZ) / 2;
            const a = 0.025 + 0.11 * clamp((depth + 1.4) / 2.8, 0, 1);
            ctx!.strokeStyle = `rgba(${fr}, ${fgc}, ${fb}, ${(a * (ringIndex === 1 ? 0.7 : 1)).toFixed(3)})`;
            ctx!.beginPath();
            ctx!.moveTo(prevX, prevY);
            ctx!.lineTo(x, y);
            ctx!.stroke();
          }
          prevX = x; prevY = y; prevZ = z;
        });
      });

      // re-project the sphere (ring pass reused index 0)
      points.forEach((p, i) => project(p, 0, i));

      // network edges
      ctx!.lineWidth = 0.8;
      edges.forEach(([a, b]) => {
        const depth = (pz[a] + pz[b]) / 2;
        let alpha = 0.03 + 0.16 * clamp((depth + 1) / 2, 0, 1);
        let hot = 0;
        if (pointer.inside) {
          const dx = (px[a] + px[b]) / 2 - mx;
          const dy = (py[a] + py[b]) / 2 - my;
          const d = Math.hypot(dx, dy);
          if (d < hoverRadius) hot = 1 - d / hoverRadius;
        }
        if (hot > 0) {
          ctx!.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${(alpha + hot * 0.6).toFixed(3)})`;
        } else {
          ctx!.strokeStyle = `rgba(${fr}, ${fgc}, ${fb}, ${alpha.toFixed(3)})`;
        }
        ctx!.beginPath();
        ctx!.moveTo(px[a], py[a]);
        ctx!.lineTo(px[b], py[b]);
        ctx!.stroke();
      });

      // points + pointer constellation
      const near: Array<{ i: number; d: number }> = [];
      for (let i = 0; i < points.length; i++) {
        const depth = clamp((pz[i] + 1) / 2, 0, 1);
        let size = 0.7 + depth * 1.5;
        let alpha = 0.14 + depth * 0.7;
        let r = fr, g = fgc, b = fb;
        if (pointer.inside) {
          const d = Math.hypot(px[i] - mx, py[i] - my);
          if (d < hoverRadius) {
            const hot = 1 - d / hoverRadius;
            size += hot * 2.4;
            alpha = Math.min(1, alpha + hot * 0.6);
            r = gr; g = gg; b = gb;
            if (pz[i] > -0.2) near.push({ i, d });
          }
        }
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(px[i], py[i], size * ps[i] * 0.8, 0, Math.PI * 2);
        ctx!.fill();
      }

      if (near.length > 0) {
        near.sort((p, q) => p.d - q.d);
        ctx!.lineWidth = 0.9;
        near.slice(0, 7).forEach(({ i, d }) => {
          const a = (1 - d / hoverRadius) * 0.65;
          ctx!.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${a.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(mx, my);
          ctx!.lineTo(px[i], py[i]);
          ctx!.stroke();
        });
        const halo = ctx!.createRadialGradient(mx, my, 0, mx, my, hoverRadius);
        halo.addColorStop(0, `rgba(${gr}, ${gg}, ${gb}, 0.16)`);
        halo.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
        ctx!.fillStyle = halo;
        ctx!.beginPath();
        ctx!.arc(mx, my, hoverRadius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    // loop ------------------------------------------------------------------
    let running = false;
    let frame = 0;
    let visible = true;
    const tick = (time: number) => {
      frame = 0;
      if (!running) return;

      pointer.x += (pointer.tx - pointer.x) * 0.07;
      pointer.y += (pointer.ty - pointer.y) * 0.07;
      yawOffset += (pointer.x * 0.9 - yawOffset) * 0.05;
      pitchOffset += (pointer.y * 0.35 - pitchOffset) * 0.05;

      const box = hero.getBoundingClientRect();
      heroProgress = clamp(-box.top / Math.max(box.height * 0.8, 1), 0, 1);

      hero.style.setProperty("--px", pointer.x.toFixed(3));
      hero.style.setProperty("--py", pointer.y.toFixed(3));
      hero.style.setProperty("--hero-p", heroProgress.toFixed(3));

      const hud = `X ${pointer.x >= 0 ? "+" : "−"}${Math.abs(pointer.x).toFixed(2)}  Y ${pointer.y >= 0 ? "+" : "−"}${Math.abs(pointer.y).toFixed(2)}`;
      if (hud !== lastHud && hudRef.current) {
        hudRef.current.textContent = hud;
        lastHud = hud;
      }

      draw(time);
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibility.observe(hero);

    const onVisibilityChange = () => (document.hidden ? stop() : start());
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (reduce) draw(0);
    else start();

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div className="hero-spatial" ref={stageRef} aria-hidden="true">
      <div className="hero-light" />
      <canvas className="hero-canvas" ref={canvasRef} />
      <div className="hero-wordmark-wrap">
        <Image
          className="hero-wordmark"
          src="/helyx-it-logo.png"
          alt=""
          width={740}
          height={310}
          priority
          sizes="(max-width: 700px) 60vw, 28vw"
        />
      </div>
      <span className="spatial-coordinate spatial-coordinate--top">H / X — 01</span>
      <span className="spatial-coordinate spatial-coordinate--bottom" ref={hudRef}>X +0.00  Y +0.00</span>
    </div>
  );
}
