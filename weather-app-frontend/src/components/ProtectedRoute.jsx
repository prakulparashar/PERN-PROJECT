import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(null);
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    // Case 1: Pehle se login hi nahi hai
    if (!refreshToken) {
      alert("Please login or register to continue");
      setIsValid(false);
      return;
    }

    // Case 2: Refresh token hai toh backend se verify karo
    fetch("http://localhost:5002/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("accessToken", data.accessToken);
        setIsValid(true);
      })
      .catch(() => {
        localStorage.clear();
        alert("Session expired, please login again");
        setIsValid(false);
      });
  }, [refreshToken]);

  if (isValid === null) {
    return <div>Loading...</div>; // loader dikha do jab tak check ho raha hai
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
