import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaHeart, FaShareAlt, FaShoppingCart } from "react-icons/fa";
import NavBar from "./navBar";
import "../css/ProductDetail.css";

const ProductCard = () => {
  const [productInfo, setProductInfo] = useState("");

  useEffect(() => {
    const currentPath = window.location.pathname;
    const paths = currentPath.split("/");
    const productId = paths[paths.length - 1];

    const getProductInfo = async (id) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        console.log(response.data.data.product);
        setProductInfo(response.data.data.product);
      } catch (error) {
        console.log(error);
      }
    };
    getProductInfo(productId);
  }, []);

  return (
    <>
      <NavBar />
      <div className="detail-wrap">
        <div className="detail-card">
          <div className="detail-image">
            <img src={productInfo.img} alt={productInfo.name || "Product"} />
            <div className="detail-icon-row">
              <button className="icon-btn" aria-label="Like">
                <FaHeart color="#f97fa8" />
              </button>
              <button className="icon-btn" aria-label="Share">
                <FaShareAlt color="#ad97ff" />
              </button>
              <button className="icon-btn" aria-label="Add to cart">
                <FaShoppingCart color="#7ad8b4" />
              </button>
            </div>
          </div>

          <p className="detail-name">{productInfo.name}</p>
          <p className="detail-price">₹ {productInfo.cost_per_day} / day</p>

          <div className="detail-chips">
            {productInfo.size && <span className="chip">Size: {productInfo.size}</span>}
            {productInfo.category && (
              <span className="chip chip-mint">{productInfo.category}</span>
            )}
          </div>

          <div className="detail-description">
            {productInfo.product_description || "No description provided."}
          </div>

          <button className="btn btn-primary btn-block">Contact Owner</button>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
