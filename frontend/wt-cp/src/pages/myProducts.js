import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar";
import axios from "axios";
import "../css/Shopping.css";
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
    <div className="page">
      <NavBar />
      <div className="margin">
        <h2 className="page-heading">My Products</h2>
        <p className="page-subheading">Manage the items you've listed for rent.</p>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">📦</div>
            <h3>You haven't listed anything yet</h3>
            <p>Head to the Rent page to list your first item.</p>
            <Link to="/rent" className="btn btn-primary" style={{ marginTop: 12 }}>
              + Rent out an item
            </Link>
          </div>
        ) : (
        <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-link" key={index}>
              <div className="product-card">
                <div className="product-link">
                  <div className="image-placeholder">
                    <img src={product.img} alt={product.img} />
                  </div>
                  <div className="row p10">
                    <div>{product.name}</div>
                    <div>₹ {product.cost_per_day}</div>
                  </div>
                </div>
                <div className="card-actions">
                  <Link to={`/updateProduct/${product._id}`} style={{ flex: 1 }}>
                    <button data-id={product._id} className="btn btn-secondary btn-block">
                      Edit
                    </button>
                  </Link>
                  <button
                    data-id={product._id}
                    className="btn btn-danger"
                    onClick={deleteProduct}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
