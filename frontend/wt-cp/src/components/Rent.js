import React, { useState } from 'react';
import './Rent.css';

const FormPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    category: '',
    sub_category: '',
    material: '',
    type: '',
    available_quantity: '',
    fit_type: '',
    collar_styles: '',
    size: '',
    sleeve_style: '',
    brand: '',
    cost_per_day: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
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
          onChange={handleChange}
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
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
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
        {formData.sub_category === 'Clothing' || formData.sub_category === 'Costumes' ? (
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
