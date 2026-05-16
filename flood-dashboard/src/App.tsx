import { useState, useEffect } from 'react';
import HomePage from './screens/HomePage';
import HomePageAlert from './screens/HomePageAlert';
import AlertPage from './screens/AlertPage';

type Screen = 'home' | 'home-alert' | 'alert';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  // Automatically transition from home → home-alert after 10 seconds
  useEffect(() => {
    if (screen !== 'home') return;
    const timer = setTimeout(() => setScreen('home-alert'), 10_000);
    return () => clearTimeout(timer);
  }, [screen]);

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundImage: "url('/coastal-background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {screen === 'home' && <HomePage />}
      {screen === 'home-alert' && (
        <HomePageAlert onAlertClick={() => setScreen('alert')} />
      )}
      {screen === 'alert' && (
        <AlertPage onBack={() => setScreen('home-alert')} />
      )}
    </div>
  );
}
