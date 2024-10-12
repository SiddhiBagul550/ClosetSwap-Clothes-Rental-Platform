import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import img from './assets/ClosetSwap.jpg'; // Update image path if needed

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/category"); // Navigate to the category page
    }, 3000); // 3000ms = 3 seconds

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ backgroundColor: '#D8ACA1', height: '100vh', width: '100vw' }}>
      <img 
        src={img} 
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
