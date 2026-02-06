import React, { useEffect, useState } from "react";
import Product from "./Product";
import Nav from "./Nav";
import "./Product.css";

export default function CartPage() {
  const [cartIds, setCartIds] = useState([]);
  const [products, setProducts] = useState([]);

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("http://localhost:5002/auth/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartIds(data);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    fetchCart();
  }, []);

  // Fetch products and filter by cartIds
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5002/auth/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        const filtered = data.filter((p) => cartIds.includes(p.id));
        setProducts(
          filtered.map((p) => ({
            ...p,
            image_url: `http://localhost:5002${p.image_url}`,
          }))
        );
      } catch (err) {
        console.error("Products fetch error:", err);
      }
    };
    if (cartIds.length > 0) fetchProducts();
  }, [cartIds]);

  return (
    <div>
      <Nav />
      <h2 style={{ padding: "20px" }}>My Cart 🛒</h2>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((p) => (
            <Product
              key={p.id}
              product={p}
              wishlist={[]} // not handling toggle here
              cart={cartIds}
              onToggleWishlist={() => {}}
              onToggleCart={() => {}}
            />
          ))
        ) : (
          <p style={{ padding: "20px" }}>No items in your cart yet.</p>
        )}
      </div>
    </div>
  );
}
