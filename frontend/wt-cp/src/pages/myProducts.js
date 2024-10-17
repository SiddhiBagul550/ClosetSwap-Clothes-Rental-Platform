import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import axios from "axios";
// import "../css/Shopping.css";
import { Link, useLocation } from "react-router-dom";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/products?owner=${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`, // Set your token or any other header
            },
          }
        );
        setProducts(response.data.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();
  }, [location.pathname]);

  const editProduct = () => {};

  const deleteProduct = async (e) => {
    const productId = e.currentTarget.getAttribute("data-id");
    const conf = window.confirm("Are you sure you want to delete?");

    if (!conf) return;

    try {
      await axios.delete(`http://127.0.0.1:3001/api/v1/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.jwtToken}`,
        },
      });
      window.location.reload();
    } catch (error) {
      console.log("Error : " + error);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="margin">
        <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-link" key={index}>
              <div className="product-card">
                <div className="product-link">
                  <div className="image-placeholder">
                    <img src={product.img} alt={product.img} />
                  </div>
                  <div className="row">
                    <div>{product.name}</div>
                    <div>₹ {product.cost_per_day}</div>
                  </div>
                </div>
                <div className="row">
                  <Link to={`/updateProduct/${product._id}`}>
                    <button data-id={product._id} className="switch-account">
                      Edit Product
                    </button>
                  </Link>
                  <button
                    data-id={product._id}
                    className="switch-account"
                    onClick={deleteProduct}
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
