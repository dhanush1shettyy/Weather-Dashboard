"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide ambient background effect:
 *  - a few large, slowly drifting blue/purple nebula blobs (pure CSS animation)
 *  - a soft nebula glow that follows the cursor with smooth lag
 *
 * Mounted once in layout.tsx so it persists across route changes.
 * Fully pointer-events: none — never blocks clicks.
 */
export default function NebulaFX() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = cursorRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let hasMoved = false;
    let rafId: number;

    function onMouseMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        currentX = targetX;
        currentY = targetY;
        el!.style.opacity = "1";
      }
    }

    function tick() {
      // smooth lag toward the real cursor position
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el!.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="nebula-fx" aria-hidden="true">
      <div className="nebula-blob nebula-blob-1" />
      <div className="nebula-blob nebula-blob-2" />
      <div className="nebula-blob nebula-blob-3" />
      <div ref={cursorRef} className="nebula-cursor" />
    </div>
  );
}
