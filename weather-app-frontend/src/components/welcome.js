import React from "react";
import "./Welcome.css";

import img4 from "../assets/oldmoney.jpg";
import img5 from "../assets/jordan2.jpeg";
import img6 from "../assets/tv.jpg";

export default function Welcome() {
    return (
      <div className="landing-container">
        <div className="section section1" style={{ backgroundImage: `url(${img4})` }}>
          <h1 className="section-text">APPARELS</h1>
        </div>
        <div className="section section2" style={{ backgroundImage: `url(${img5})` }}>
          <h1 className="section-text">SNEAKERS</h1>
        </div>
        <div className="section section3" style={{ backgroundImage: `url(${img6})` }}>
          <h1 className="section-text">APPLICANCES</h1>
        </div>
  
        <div className="button-container">
          <a href="register" className="btn">Register</a>
          <a href="login" className="btn">Login</a>
        </div>
      </div>
    );
  }