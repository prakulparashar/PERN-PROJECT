import React, { useEffect, useState } from "react";
import Product from "./Product";
import "./Product.css";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]); // ✅ added cart state

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // Fetch products (public)(only runs on intial mount cuz dependency array is empty)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5002/auth/products");
        if (!res.ok) throw new Error(`Products ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch wishlist (protected)
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch("http://localhost:5002/auth/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      }
    };
    fetchWishlist();
  }, []);

  // Fetch cart (protected)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch("http://localhost:5002/auth/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();
        setCart(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    fetchCart();
  }, []);

  // Toggle wishlist
  const handleToggleWishlist = async (productId) => {
    const token = getToken();
    if (!token) {
      alert("Please log in to use wishlist");
      return;
    }

    const isIn = wishlist.includes(productId);
    setWishlist((prev) =>
      isIn ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    try {
      const url = `http://localhost:5002/auth/wishlist/${productId}`;
      const res = await fetch(url, {
        method: isIn ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setWishlist((prev) =>
          isIn ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  // Toggle cart
  const handleToggleCart = async (productId) => {
    const token = getToken();
    if (!token) {
      alert("Please log in to use cart");
      return;
    }

    const isIn = cart.includes(productId);
    setCart((prev) =>
      isIn ? prev.filter((id) => id !== productId) : [...prev, productId]
    );

    try {
      const url = `http://localhost:5002/auth/cart/${productId}`;
      const res = await fetch(url, {
        method: isIn ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setCart((prev) =>
          isIn ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
      }
    } catch (err) {
      console.error("Cart toggle error:", err);
    }
  };

  return (
    <div className="product-list">
      {products.map((p) => (
        <Product
          key={p.id}
          product={{
            ...p,
            image_url: `http://localhost:5002${p.image_url}`,
          }}
          wishlist={wishlist}
          cart={cart} 
          onToggleWishlist={handleToggleWishlist}
          onToggleCart={handleToggleCart}
        />
      ))}
    </div>
  );
}
