import React from "react";
import { useNavigate } from "react-router-dom";
import "./Nav.css";
import {AiOutlineLogout} from "react-icons/ai";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        alert("No refresh token found");
        return;
      }

      // call backend logout API
      const res = await fetch("http://localhost:5002/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();
      console.log("Logout response:", data);

      if (res.ok) {
        // clear tokens only if backend confirmed
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        alert(data.msg || "Logout successful");
        navigate("/login");
      } else {
        alert("Logout failed: " + data.msg);
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="nav-logout-button"
    >
      <AiOutlineLogout className="nav-icons"/>
    </button>
  );
}
