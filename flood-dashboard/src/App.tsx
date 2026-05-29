import { useState, useEffect, useRef } from 'react';
import HomePage from './screens/HomePage';
import HomePageAlert from './screens/HomePageAlert';
import AlertPage from './screens/AlertPage';

type Screen = 'home' | 'home-alert' | 'alert';

const bgBase = {
  backgroundSize: 'cover' as const,
  backgroundPosition: 'center' as const,
  backgroundRepeat: 'no-repeat' as const,
};

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [transiting, setTransiting] = useState<'none' | 'zoom-in' | 'zoom-out'>('none');

  const s2Ref = useRef<HTMLDivElement | null>(null);
  const s3BgRef = useRef<HTMLDivElement | null>(null);
  const s3Ref = useRef<HTMLDivElement | null>(null);
  const s2BgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (screen !== 'home') return;
    const timer = setTimeout(() => setScreen('home-alert'), 10_000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function handleRedZoneClick(clientX: number, clientY: number) {
    cancelAnimationFrame(rafRef.current);
    setTransiting('zoom-in');

    const DURATION = 1000;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MAX_SCALE = 5.5;
    const start = performance.now();

    function frame(now: number) {
      const rawT = Math.min((now - start) / DURATION, 1);
      const easedT = easeOut(rawT);

      if (s2Ref.current) {
        const scale = 1 + easedT * 4.5;
        const tx = MAX_SCALE * easedT * (vw / 2 - clientX);
        const ty = MAX_SCALE * easedT * (vh / 2 - clientY);
        const opacity = rawT < 0.7 ? 1 : 1 - (rawT - 0.7) / 0.3;
        s2Ref.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        s2Ref.current.style.opacity = String(Math.max(0, opacity));
      }

      if (s3BgRef.current) {
        const op = rawT < 0.7 ? 0 : (rawT - 0.7) / 0.3;
        s3BgRef.current.style.opacity = String(Math.min(1, op));
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setScreen('alert');
        setTransiting('none');
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  function handleZoomOut() {
    cancelAnimationFrame(rafRef.current);
    setTransiting('zoom-out');

    const DURATION = 700;
    const start = performance.now();

    function frame(now: number) {
      const rawT = Math.min((now - start) / DURATION, 1);
      const easedT = easeOut(rawT);

      if (s3Ref.current) {
        const scale = 1 - easedT * 0.75;
        const opacity = rawT < 0.3 ? 1 : 1 - (rawT - 0.3) / 0.7;
        s3Ref.current.style.transform = `scale(${Math.max(0.25, scale)})`;
        s3Ref.current.style.opacity = String(Math.max(0, opacity));
      }

      if (s2BgRef.current) {
        const op = rawT < 0.3 ? 0 : (rawT - 0.3) / 0.7;
        s2BgRef.current.style.opacity = String(Math.min(1, op));
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setScreen('home-alert');
        setTransiting('none');
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Screen 1 */}
      {screen === 'home' && (
        <div className="absolute inset-0" style={{ ...bgBase, backgroundImage: "url('/home-page-new-map.png')" }}>
          <HomePage />
        </div>
      )}

      {/* Harbor background — bottom layer during zoom-in; rAF fades opacity 0→1 in last 30% */}
      {screen === 'home-alert' && transiting === 'zoom-in' && (
        <div
          ref={s3BgRef}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/harbor-district-bg.png')", opacity: 0 }}
        />
      )}

      {/* Screen 2 — rAF drives translate + scale + opacity during zoom-in */}
      {screen === 'home-alert' && (
        <div
          ref={s2Ref}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/coastal-background.png')" }}
        >
          <HomePageAlert onRedZoneClick={handleRedZoneClick} />
        </div>
      )}

      {/* Coastal background — bottom layer during zoom-out; rAF fades opacity 0→1 after first 30% */}
      {screen === 'alert' && transiting === 'zoom-out' && (
        <div
          ref={s2BgRef}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/coastal-background.png')", opacity: 0 }}
        />
      )}

      {/* Screen 3 — rAF drives scale + opacity during zoom-out */}
      {screen === 'alert' && (
        <div
          ref={s3Ref}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/harbor-district-bg.png')" }}
        >
          <AlertPage onZoomOut={handleZoomOut} />
        </div>
      )}
    </div>
  );
}
