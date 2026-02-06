import { useState } from "react";
import "./ProductUpload.css";
import Nav from "./Nav";

function ProductUpload() {
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert("Please log in first");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));

    try {
      const res = await fetch("http://localhost:5002/auth/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      alert("✅ Product uploaded successfully!");
      setForm({}); // reset form
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload product");
    }
  };

  return (
    <div className="upload-container">
      <Nav />
      <div className="upload-card">
        <h2 className="upload-title">Upload New Product</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <input
            name="title"
            placeholder="Title"
            onChange={handleChange}
            required
          />

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />

          <div className="form-row">
            <input
              name="star_rating"
              placeholder="Star Rating"
              onChange={handleChange}
            />
            <input
              name="reviews_count"
              placeholder="Reviews Count"
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              name="prev_price"
              placeholder="Previous Price"
              onChange={handleChange}
            />
            <input
              name="new_price"
              placeholder="New Price"
              onChange={handleChange}
            />
          </div>

          <input name="company" placeholder="Company" onChange={handleChange} />

          <input name="color" placeholder="Color" onChange={handleChange} />

          <select name="category" onChange={handleChange} required>
            <option value="">-- Select Category --</option>
            <option value="Shoes">Shoes</option>
            <option value="Clothing">Clothing</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
          </select>

          {/* 💰 Seller Payment Info */}
          <h3 className="payment-title">Payment Information</h3>
          <input
            name="upi_id"
            placeholder="UPI ID (e.g. name@upi)"
            onChange={handleChange}
          />
          <input
            name="bank_account"
            placeholder="Bank Account Number (optional)"
            onChange={handleChange}
          />
          <input
            name="ifsc"
            placeholder="IFSC Code (optional)"
            onChange={handleChange}
          />

          <button type="submit">Upload Product</button>
        </form>
      </div>
    </div>
  );
}

export default ProductUpload;
