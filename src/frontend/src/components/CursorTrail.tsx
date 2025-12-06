import { useEffect, useRef, useState } from 'react';

const TRAIL_CONFIG = [
  { size: 26, color: 'var(--color-accent)', blur: 30, opacity: 0.35 },
  { size: 18, color: 'var(--color-accent-2)', blur: 20, opacity: 0.3 },
  { size: 12, color: 'rgba(255,255,255,0.8)', blur: 12, opacity: 0.25 }
];

type Position = { x: number; y: number };

export function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const [positions, setPositions] = useState<Position[]>(() => TRAIL_CONFIG.map(() => ({ x: -100, y: -100 })));
  const targetRef = useRef<Position>({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    setEnabled(media.matches);
    const listener = () => setEnabled(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      setPositions(prev =>
        prev.map((pos, index) => {
          const speed = 0.18 + index * 0.12;
          return {
            x: pos.x + (targetRef.current.x - pos.x) * speed,
            y: pos.y + (targetRef.current.y - pos.y) * speed
          };
        })
      );
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div className="cursor-trail-layer">
      {positions.map((pos, index) => {
        const config = TRAIL_CONFIG[index];
        const visible = pos.x !== -100;
        return (
          <span
            key={index}
            className={`cursor-trail-dot ${visible ? 'visible' : ''}`}
            style={{
              width: config.size,
              height: config.size,
              left: pos.x,
              top: pos.y,
              background: `radial-gradient(circle, ${config.color}, transparent 60%)`,
              filter: `blur(${config.blur}px)`,
              opacity: config.opacity
            }}
          />
        );
      })}
    </div>
  );
}

export default CursorTrail;
