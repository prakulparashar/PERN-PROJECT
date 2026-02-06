import React from "react";
import { AiOutlineShoppingCart, AiFillStar } from "react-icons/ai";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import "./Product.css";

export default function Product({ product, wishlist, cart, onToggleWishlist, onToggleCart }) {
  const isInWishlist = wishlist.includes(product.id);
  const isInCart = cart.includes(product.id);

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img
          src={product.image_url}
          alt={product.title}
          className="product-image"
        />
        <button
          className="wishlist-btn"
          onClick={() => onToggleWishlist(product.id)}
        >
          {isInWishlist ? (
            <FaHeart className="heart filled" />
          ) : (
            <FaRegHeart className="heart" />
          )}
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        <div className="product-rating">
          <AiFillStar className="star-icon" />
          <span>{product.star_rating}</span>
          <span className="reviews">({product.reviews_count} reviews)</span>
        </div>

        <div className="product-prices">
          <span className="prev-price">R.{product.prev_price}</span>
          <span className="new-price">R.{product.new_price}</span>
        </div>

        <div className="product-details">
          <span>Company: {product.company}</span>
          <span>Color: {product.color}</span>
          <span>Category: {product.category}</span>
        </div>
      </div>

      <button
        className="cart-btn"
        onClick={() => onToggleCart(product.id)}
      >
        {isInCart ? (
          <FaCheck className="cart-icon" />
        ) : (
          <AiOutlineShoppingCart className="cart-icon" />
        )}
      </button>
    </div>
  );
}
