import React, { useState, useRef } from "react";
import "./Nav.css";
import { FiHeart } from 'react-icons/fi';
import { AiOutlineHome, AiOutlineShoppingCart, AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import LogoutButton from "./LogoutButton";
import { GoPlus } from "react-icons/go";
import axios from "axios";

function Nav() {
    const [profilePic, setProfilePic] = useState(() => {
        const saved = localStorage.getItem("picture");
        if (!saved) return "";
        // If it's a full URL (Google), use it. If it's just a path, add your backend address.
        return saved.startsWith("http") ? saved : `http://localhost:5002/auth${saved}`;
    });
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.post("http://localhost:5002/auth/update-profile-pic", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}` 
                },
            });

            const finalUrl = `http://localhost:5002/auth${res.data.imageUrl}`;
            setProfilePic(finalUrl);
            localStorage.setItem("picture", finalUrl);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <nav>
            {/* New Left Container for PFP */}
            <div className="nav-left-section" onClick={() => fileInputRef.current.click()}>
                {profilePic ? (
                    <img src={profilePic} alt="PFP" className="nav-pfp" />
                ) : (
                    <AiOutlineUser className="nav-pfp-icon" />
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: "none" }} 
                    accept="image/*" 
                />
            </div>

            <div className="nav-contianer">
                <input type="text" placeholder="Enter search input" className="search-input" />
            </div>

            <div className="profile-container">
                <a href="/dashboard"><AiOutlineHome className="nav-icons" /></a>
                <a href="/wishlist"><FiHeart className="nav-icons" /></a>
                <a href="/cart"><AiOutlineShoppingCart className="nav-icons" /></a>
                {/* Removed duplicate AiOutlineUser here since it's now on the left */}
                <a href="/upload"><GoPlus className="nav-icons" /></a>
                <LogoutButton />
            </div>
        </nav>
    );
}

export default Nav;