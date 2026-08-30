// src/components/Liked.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/navBar";
import "../css/ItemList.css";

const Liked = () => {
  const [products, setProducts] = useState([]);
  const [likedItems, setlikedItems] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3001/api/v1/products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setProducts(response.data.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/users/${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setlikedItems(response.data.data.user.likeditems);
      } catch (error) {
        console.error("Error :", error);
      }
    };
    getData();
  }, []);

  const likedProducts = products.filter((product) => likedItems.includes(product._id));

  return (
    <>
      <NavBar />
      <div className="list-page">
        <h2 className="page-heading">Liked Items</h2>
        <p className="page-subheading">Everything you've favourited, all in one place.</p>

        {likedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">💗</div>
            <h3>No liked items yet</h3>
            <p>Tap the heart on a product to save it here.</p>
          </div>
        ) : (
          likedProducts.map((product) => (
            <div className="item-card" key={product._id}>
              <div className="item-image">
                <img src={product.img} alt={product.img} />
              </div>
              <div className="item-details">
                <p className="item-name">{product.name}</p>
                <p className="item-meta">Size: {product.size}</p>
                <p className="item-meta">
                  Available quantities: {product.available_quantity}
                </p>
                <p className="item-price">₹{product.cost_per_day}/day</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Liked;
