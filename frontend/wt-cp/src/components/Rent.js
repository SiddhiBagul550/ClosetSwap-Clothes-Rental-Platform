import React, { useState } from "react";
import "./Rent.css";
import axios from "axios";

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
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sub_category: "",
    material: "",
    type: "",
    available_quantity: 0,
    fit_type: "",
    collar_styles: "",
    size: "",
    sleeve_style: "NA",
    brand: "",
    cost_per_day: 0,
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
    // let data = {};
    // data.name = formData.name;
    // data.img = img;
    // data.category = formData.category;
    // data.sub_category = formData.sub_category;
    // data.material = formData.material;
    // data.type = formData.type;
    // data.available_quantity = formData.available_quantity;
    // data.fit_type = formData.fit_type;
    // data.collar_styles = formData.collar_styles;
    // data.size = formData.size;
    // data.sleeve_style = formData.sleeve_style;
    // data.brand = formData.brand;
    // data.cost_per_day = formData.cost_per_dayl;
    // data.owner = localStorage.userId;
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
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Upload Product Details</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label>Name</label>
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

        {/* Material */}
        <label>Material</label>
        <input
          type="text"
          name="material"
          value={formData.material}
          onChange={handleChange}
          required
        />

        {/* Type */}
        <label>Type</label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        />

        {/* Available Quantity */}
        <label>Available Quantity</label>
        <input
          type="number"
          name="available_quantity"
          value={formData.available_quantity}
          onChange={handleChange}
          required
        />

        {/* Fit Type */}
        <label>Fit Type</label>
        <input
          type="text"
          name="fit_type"
          value={formData.fit_type}
          onChange={handleChange}
          required
        />

        {/* Collar Styles */}
        <label>Collar Styles</label>
        <input
          type="text"
          name="collar_styles"
          value={formData.collar_styles}
          onChange={handleChange}
          required
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

        {/* Sleeve Style */}
        {formData.sub_category === "Clothing" ||
        formData.sub_category === "Costumes" ? (
          <>
            <label>Sleeve Style</label>
            <input
              type="text"
              name="sleeve_style"
              value={formData.sleeve_style}
              onChange={handleChange}
            />
          </>
        ) : null}

        {/* Brand */}
        <label>Brand</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
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
        />

        {/* Submit */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormPage;
