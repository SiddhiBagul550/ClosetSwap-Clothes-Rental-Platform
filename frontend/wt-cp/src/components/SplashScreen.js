// 
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Hook to navigate to another page
import igm from './assets/ClosetSwap.jpg';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Splash screen stays for 3 seconds, then navigates to the main page ("/home")
    const timer = setTimeout(() => {
      navigate('/home');  // Replace '/home' with your desired route
    }, 3000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ backgroundColor: '#D8ACA1', height: '100vh', width: '100vw' }}>
      <img
        src={igm}
        alt="Closet Swap"
        style={{
          height: '100vh',
          width: '100vw',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
