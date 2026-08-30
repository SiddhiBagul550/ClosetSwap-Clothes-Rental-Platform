import React, { useState } from "react";
import "../css/Rent.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";
import axios from "axios";
import { GARMENT_TYPES_BY_CATEGORY } from "../constants/garmentTypes";

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // The garment list depends on the audience, so a stale sub-category
      // from the previous category can't stick around.
      ...(name === "category" ? { sub_category: "" } : {}),
    }));
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
      await axios.post(
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
      <div className="form-page">
        <div className="form-container">
          <h2>List an item for rent</h2>
          <p className="form-subtext">Share the details so renters know exactly what they're getting.</p>

          <div className="image-preview">
            {img ? <img src={img} alt="Preview" /> : "Image preview will appear here"}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field full">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field full">
                <label>Upload Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg, image/png"
                  onChange={handleFileUpload}
                  required
                />
              </div>

              <div className="field">
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
              </div>

              <div className="field">
                <label>Sub-category</label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleChange}
                  required
                  disabled={!formData.category}
                >
                  <option value="">
                    {formData.category
                      ? "Select Sub-category"
                      : "Select a category first"}
                  </option>
                  {(GARMENT_TYPES_BY_CATEGORY[formData.category] || []).map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    )
                  )}
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Costumes">Costumes</option>
                </select>
              </div>

              <div className="field">
                <label>Available Quantity</label>
                <input
                  type="number"
                  name="available_quantity"
                  value={formData.available_quantity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="field">
                <label>Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Cost per Day (₹)</label>
                <input
                  type="number"
                  name="cost_per_day"
                  value={formData.cost_per_day}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="field full">
                <label>Product description</label>
                <textarea
                  name="product_description"
                  value={formData.product_description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Submit Listing
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default FormPage;
