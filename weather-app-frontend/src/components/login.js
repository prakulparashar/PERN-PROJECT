import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

import { GoogleLogin } from "@react-oauth/google";

import img1 from "../assets/image1.jpg";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image3.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentImg, setCurrentImg] = useState(0);
  const navigate = useNavigate();

  const images = [img1, img2, img3];

  // Rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // NORMAL LOGIN
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5002/auth/login", {
        username,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("token", res.data.accessToken);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  // GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        "http://localhost:5002/auth/google",
        { token }
      
      );
      
      localStorage.setItem("picture", res.data.picture);
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("token", res.data.accessToken);

      navigate("/dashboard");
    } catch (err) {
      alert("Google login failed");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      {/* Left: login form */}
      <div className="login-form">
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Username / Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>

        {/* GOOGLE LOGIN BUTTON */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>OR</p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google Login Failed")}
            width="250"
          />
        </div>

        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")}>Register</button>
        </p>
      </div>

      {/* Right: rotating images */}
      <div className="login-images">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Login Visual"
            className={index === currentImg ? "active" : ""}
          />
        ))}
      </div>
    </div>
  );
}
