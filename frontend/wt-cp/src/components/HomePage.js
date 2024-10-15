import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import img from "./assets/ClosetSwapNew.png"; // Update image path if needed

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/shopping"); // Navigate to the category page
    }, 3000); // 3000ms = 3 seconds

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{ backgroundColor: "#ACD1CB", height: "100vh", width: "100vw" }}
    >
      <img
        src={img}
        alt="Closet Swap"
        style={{
          height: "100vh",
          width: "100vw",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
