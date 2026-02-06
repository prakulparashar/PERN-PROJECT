import React, { useEffect, useState } from "react";
import Product from "./Product";
import "./Product.css";
import Nav from "./Nav";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cartIds, setCartIds] = useState([]); // Added to prevent 'undefined' errors
  const [products, setProducts] = useState([]);

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // 1. Fetch Wishlist & Cart IDs (so icons show correctly)
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Fetch Wishlist
        const wishRes = await fetch("http://localhost:5002/auth/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (wishRes.ok) {
          const wishData = await wishRes.json();
          setWishlistIds(wishData);
        }

        // Fetch Cart (Important to prevent crash in Product component)
        const cartRes = await fetch("http://localhost:5002/auth/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartIds(cartData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Fetch products and filter
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5002/auth/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Filter: only items in wishlist
        const filtered = data.filter((p) => wishlistIds.includes(p.id));
        
        setProducts(
          filtered.map((p) => ({
            ...p,
            // Added /auth to the path to match your backend mount point
            image_url: `http://localhost:5002/auth${p.image_url}`,
          }))
        );
      } catch (err) {
        console.error("Products fetch error:", err);
      }
    };

    if (wishlistIds.length > 0) {
        fetchProducts();
    } else {
        setProducts([]); // Clear products if wishlist is empty
    }
  }, [wishlistIds]);

  return (
    <div>
      <Nav />
      <h2 style={{ padding: "20px" }}>My Wishlist ❤️</h2>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((p) => (
            <Product
              key={p.id}
              product={p}
              wishlist={wishlistIds}
              cart={cartIds} // Pass cartIds to prevent the 'includes' crash
              onToggleWishlist={() => {}} 
              onToggleCart={() => {}} 
            />
          ))
        ) : (
          <p style={{ padding: "20px" }}>No items in your wishlist yet.</p>
        )}
      </div>
    </div>
  );
}