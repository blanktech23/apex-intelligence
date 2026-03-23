"use client";

import { useEffect, useState, useCallback } from "react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocityX: number;
  velocityY: number;
  delay: number;
  shape: "square" | "circle" | "strip";
}

const COLORS = [
  "#6366f1", // primary indigo
  "#22d3ee", // cyan
  "#22c55e", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#a855f7", // purple
  "#f97316", // orange
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
    velocityX: (Math.random() - 0.5) * 80,
    velocityY: -(30 + Math.random() * 50),
    delay: Math.random() * 400,
    shape: (["square", "circle", "strip"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Read motion preference after mount to avoid hydration mismatch
  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const fire = useCallback(() => {
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }
    setParticles(createParticles(40));
    setIsActive(true);
    setTimeout(() => {
      setIsActive(false);
      setParticles([]);
      onComplete?.();
    }, 2500);
  }, [prefersReducedMotion, onComplete]);

  useEffect(() => {
    if (trigger) fire();
  }, [trigger, fire]);

  if (!isActive || prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}ms`,
            animationDuration: "2s",
            // CSS custom properties for the animation
            "--confetti-vx": `${p.velocityX}px`,
            "--confetti-vy": `${p.velocityY}px`,
            "--confetti-rot": `${p.rotation}deg`,
          } as React.CSSProperties}
        >
          <div
            style={{
              width: p.shape === "strip" ? 4 : 8,
              height: p.shape === "strip" ? 14 : 8,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "strip" ? 2 : 1,
              transform: `scale(${p.scale})`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
