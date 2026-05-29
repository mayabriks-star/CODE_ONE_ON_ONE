import { useState, useEffect } from 'react';
import HomePage from './screens/HomePage';
import HomePageAlert from './screens/HomePageAlert';
import AlertPage from './screens/AlertPage';

type Screen = 'home' | 'home-alert' | 'alert';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [transiting, setTransiting] = useState<'none' | 'zoom-in' | 'zoom-out'>('none');
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);

  useEffect(() => {
    if (screen !== 'home') return;
    const timer = setTimeout(() => setScreen('home-alert'), 10_000);
    return () => clearTimeout(timer);
  }, [screen]);

  function handleRedZoneClick(clientX: number, clientY: number) {
    setOriginX(clientX);
    setOriginY(clientY);
    setTransiting('zoom-in');
    setTimeout(() => {
      setScreen('alert');
      setTransiting('none');
    }, 500);
  }

  function handleZoomOut() {
    setOriginX(window.innerWidth / 2);
    setOriginY(window.innerHeight / 2);
    setTransiting('zoom-out');
    setTimeout(() => {
      setScreen('home-alert');
      setTransiting('none');
    }, 400);
  }

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundImage: screen === 'home'
          ? "url('/home-page-new-map.png')"
          : screen === 'alert'
            ? "url('/harbor-district-bg.png')"
            : "url('/coastal-background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: transiting === 'zoom-in' ? 'scale(3.5)' : transiting === 'zoom-out' ? 'scale(0.3)' : 'scale(1)',
        transformOrigin: `${originX}px ${originY}px`,
        opacity: transiting !== 'none' ? 0 : 1,
        transition: transiting !== 'none' ? 'transform 0.5s ease-in, opacity 0.4s ease-in' : 'none',
      }}
    >
      {screen === 'home' && <HomePage />}
      {screen === 'home-alert' && (
        <HomePageAlert onRedZoneClick={handleRedZoneClick} />
      )}
      {screen === 'alert' && (
        <AlertPage onZoomOut={handleZoomOut} />
      )}
    </div>
  );
}
