import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Use useNavigate instead of useHistory
import "./Shopping.css";
import logo from "./assets/ClosetSwapNew.png";
import axios from "axios";
import UserInfo from "./UserInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"; // unfilled heart
import {
  faHeart as fasHeart,
  faLink,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons"; // solid heart, link, and cart

function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [products, setProducts] = useState([]);
  const [likeditems, setlikeditems] = useState([]); // State for liked products
  const navigate = useNavigate(); // Use navigate instead of history
  const location = useLocation();

  // Toggle profile visibility
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  // Fetch products on component mount and URL path change
  useEffect(() => {
    // if (selectedCategories.length !== 0) {
    //   setUrl(url + `?category=${selectedCategories[0]}`);
    //   console.log(url);
    // }
    const getProducts = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3001/api/v1/products",
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "men" && checked) {
      navigate("/men"); // Use navigate instead of history.push
    }
  };

  // Toggle like for a specific product
  const toggleLike = (productId) => {
    setlikeditems((prevLiked) => {
      if (prevLiked.includes(productId)) {
        return prevLiked.filter((id) => id !== productId); // Remove if already liked
      } else {
        return [...prevLiked, productId]; // Add to liked
      }
    });
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="header">
        <img
          src={logo}
          alt="Closet Swap"
          style={{
            height: "7vh",
            width: "10vw",
            objectFit: "contain",
          }}
        />
        <div className="search-bar">
          <input type="text" placeholder="Search for products" />
          <button className="voice-icon">🎤</button>
        </div>
        <div className="top-bar-icons">
          <Link to="/rent" className="rent-button">
            ➕ Rent
          </Link>
          <Link to="/liked-items" className="top-icon">
            💖 Liked Items
          </Link>
          <Link to="/cart" className="top-icon">
            🛒 Cart
          </Link>
          <div className="profile-icon" onClick={toggleProfile}>
            👤 Profile
          </div>
        </div>
      </header>

      {/* Main content with filters and product grid */}
      <div className="main-content">
        {/* Filter section */}
        <aside className="filter-section">
          <h3>Filters</h3>
          <div className="filter-group">
            <h4>Category</h4>
            <label>
              <input
                type="checkbox"
                value="men"
                onChange={handleCheckboxChange}
              />{" "}
              Men
            </label>
            <label>
              <input
                type="checkbox"
                value="women"
                onChange={handleCheckboxChange}
              />{" "}
              Women
            </label>
            <label>
              <input
                type="checkbox"
                value="kids"
                onChange={handleCheckboxChange}
              />{" "}
              Kids
            </label>
          </div>

          <div className="filter-group">
            <h4>Subcategories</h4>
            <label>
              <input type="checkbox" /> Clothing
            </label>
            <label>
              <input type="checkbox" /> Costume
            </label>
            <label>
              <input type="checkbox" /> Footwear
            </label>
            <label>
              <input type="checkbox" /> Accessories
            </label>
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            <label>
              <input type="checkbox" /> Under ₹100
            </label>
            <label>
              <input type="checkbox" /> ₹100 - ₹500
            </label>
          </div>

          <div className="filter-group">
            <h4>Seller</h4>
            <label>
              <input type="checkbox" /> Seller A
            </label>
            <label>
              <input type="checkbox" /> Seller B
            </label>
            <label>
              <input type="checkbox" /> Seller C
            </label>
            <label>
              <input type="checkbox" /> Seller D
            </label>
          </div>
        </aside>

        {/* Product grid */}
        <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-link" key={index}>
              <div className="product-card">
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="image-placeholder">
                    <img src={product.img} alt={product.img} />
                  </div>
                  <div className="row">
                    <div>{product.name}</div>
                    <div>₹ {product.cost_per_day}</div>
                  </div>
                </Link>
                <div className="row">
                  <span onClick={() => toggleLike(product._id)}>
                    <FontAwesomeIcon
                      icon={
                        likeditems.includes(product._id) ? fasHeart : farHeart
                      }
                      style={{
                        color: likeditems.includes(product._id)
                          ? "red"
                          : "black",
                      }}
                    />
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faLink} />
                  </span>
                  <span>
                    <FontAwesomeIcon icon={faCartShopping} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile section */}
      {showProfile && <UserInfo />}
    </div>
  );
}

export default App;
