import { useState, useEffect, type ReactNode } from 'react';

// Figma design canvas dimensions — do not change without reviewing all absolute positions
const DESIGN_W = 1512;
const DESIGN_H = 1008;

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Scales the 1512×1008 Figma design canvas to fit within the actual browser viewport.
 * The background image (set on App root) remains full-screen; only UI panels scale.
 * Scale = min(1, viewportW / 1512, viewportH / 1008) — shrinks when viewport is smaller,
 * never enlarges beyond 1× so the design stays crisp on large displays.
 * Transform origin is top-left to preserve the top and left panel alignment.
 */
export default function ScaledLayout({ children, className = '' }: Props) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const scaleW = window.innerWidth / DESIGN_W;
      const scaleH = window.innerHeight / DESIGN_H;
      setScale(Math.min(1.0, scaleW, scaleH));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${DESIGN_W}px`,
        height: `${DESIGN_H}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
  );
}
