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
      <h2 className="update-product-heading">Update product details</h2>
      <h3 className="update-product-heading">{data.name}</h3>
      <form className="update-form" onSubmit={handleSubmit}>
        <label>Product description</label>
        <input
          type="text"
          name="product_description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />

        <label>Available Quantity</label>
        <input
          type="number"
          name="available_quantity"
          value={availableQuantity}
          onChange={(e) => setAvailableQuantity(e.target.value)}
        />

        <label>Cost per Day</label>
        <input
          type="number"
          name="cost_per_day"
          value={costPerDay}
          onChange={(e) => setCostPerDay(e.target.value)}
        />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
