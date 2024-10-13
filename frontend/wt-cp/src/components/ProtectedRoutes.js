import axios from "axios";
import React from "react";
import { Navigate } from "react-router-dom";

export const isAuthenticated = async () => {
  // const token = localStorage.getItem("jwtToken");
  // if (!token) return false;

  // try {
  //   const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
  //   const currentTime = Date.now() / 1000; // Current time in seconds
  //   // console.log(payload.exp, currentTime);
  //   return payload.exp > currentTime; // Check if token is expired
  // } catch (e) {
  //   return false;
  // }

  const response = await axios.get(
    "http://localhost:3001/api/v1/users/verify",
    { withCredentials: true }
  );
  console.log(response);
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content

  return children;
};

export default ProtectedRoute;
