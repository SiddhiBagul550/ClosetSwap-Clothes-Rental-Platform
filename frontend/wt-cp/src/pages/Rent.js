import React, { useState } from "react";
import "../css/Rent.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";
import axios from "axios";
import NavBar from "../components/navBar";

function convert(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

const FormPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sub_category: "",
    available_quantity: 0,
    size: "",
    cost_per_day: 0,
    product_description: "",
  });
  const [img, setImg] = useState("");
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convert(file);
    setImg(base64);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateData = () => {
    if (formData.cost_per_day <= 0 || formData.available_quantity <= 0) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateData()) {
      alert("invalidat data ");
      return;
    }
    console.log({ ...formData, img: img, owner: localStorage.userId });
    try {
      const response = await axios.post(
        "http://127.0.0.1:3001/api/v1/products/",
        { ...formData, img: img, owner: localStorage.userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.jwtToken}`,
          },
        }
      );
      alert("Done");
      navigate("/shopping");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className="form-container">
        <h2>Upload Product Details</h2>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Image */}
          <label>Upload Image</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg, image/png"
            onChange={handleFileUpload}
            required
          />

          {/* Category */}
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>

          {/* Sub-category */}
          <label>Sub-category</label>
          <select
            name="sub_category"
            value={formData.sub_category}
            onChange={handleChange}
            required
          >
            <option value="">Select Sub-category</option>
            <option value="Accessories">Accessories</option>
            <option value="Costumes">Costumes</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
          </select>

          {/* Available Quantity */}
          <label>Available Quantity</label>
          <input
            type="number"
            name="available_quantity"
            value={formData.available_quantity}
            onChange={handleChange}
            required
            min="1"
          />

          {/* Size */}
          <label>Size</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
          />

          {/* Cost per Day */}
          <label>Cost per Day</label>
          <input
            type="number"
            name="cost_per_day"
            value={formData.cost_per_day}
            onChange={handleChange}
            required
            min="1"
          />

          <label>Product description</label>
          <input
            type="text"
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            required
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default FormPage;
