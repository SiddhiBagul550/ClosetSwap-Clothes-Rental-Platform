import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/UpdateProduct.css";
import axios from "axios";

export default function UpdateProduct() {
  const navigate = useNavigate();
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [costPerDay, setCostPerDay] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [data, setData] = useState([]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("You want to update product details!")) return;

    let updatedData = {};
    const currentPath = window.location.pathname;
    const paths = currentPath.split("/");
    const productId = paths[paths.length - 1];
    if (costPerDay) {
      updatedData.cost_per_day = costPerDay;
    }
    if (availableQuantity) {
      updatedData.available_quantity = availableQuantity;
    }
    if (productDescription) {
      updatedData.product_description = productDescription;
    }

    const update = async () => {
      try {
        const response = await axios.patch(
          `http://127.0.0.1:3001/api/v1/products/${productId}`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        console.log(response.data.data.product);
      } catch (error) {
        console.log(error);
      }
    };

    update();
    navigate("/myProducts");
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const paths = currentPath.split("/");
    const productId = paths[paths.length - 1];
    const getData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/products/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setData(response.data.data.product);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <div className="main-container">
      <h2 className="update-product-heading page-heading">Update product details</h2>
      <p className="page-subheading">{data.name}</p>
      <form className="update-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Product description</label>
          <textarea
            name="product_description"
            placeholder={data.product_description || "Enter a new description"}
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Available Quantity</label>
          <input
            type="number"
            name="available_quantity"
            placeholder={
              data.available_quantity !== undefined
                ? `Current: ${data.available_quantity}`
                : ""
            }
            value={availableQuantity}
            onChange={(e) => setAvailableQuantity(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Cost per Day (₹)</label>
          <input
            type="number"
            name="cost_per_day"
            placeholder={
              data.cost_per_day !== undefined ? `Current: ${data.cost_per_day}` : ""
            }
            value={costPerDay}
            onChange={(e) => setCostPerDay(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">
          Update
        </button>
      </form>
    </div>
  );
}
