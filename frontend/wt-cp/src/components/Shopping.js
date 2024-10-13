import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Use useNavigate instead of useHistory
import "./Shopping.css";
import logo from "./assets/ClosetSwap.jpg";
import axios from "axios";

function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [isMenChecked, setIsMenChecked] = useState(false);
  const [products, setProducts] = useState([]);

  const navigate = useNavigate(); // Use navigate instead of history
  const location = useLocation();

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  // Check the URL path and update the checkbox accordingly
  useEffect(() => {
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
        console.log(response.data.data.products);
        setProducts(response.data.data.products);
      } catch (error) {
        setProducts(error);
      }
    };
    getProducts();
    if (location.pathname === "/men") {
      setIsMenChecked(true);
    } else {
      setIsMenChecked(false);
    }
  }, [location.pathname]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name === "men" && checked) {
      // Redirect to /men page if Men is checked
      navigate("/men"); // Use navigate instead of history.push
    }
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="header">
        <img
          src={logo}
          alt="Closet Swap"
          style={{
            height: "10vh",
            width: "10vw",
            objectFit: "contain",
          }}
        />
        <div className="search-bar">
          <input type="text" placeholder="Search for products" />
          <button className="voice-icon">🎤</button>
        </div>

        <div className="top-bar-icons">
          <Link to="/upload" className="rent-button">
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
                name="men"
                checked={isMenChecked}
                onChange={handleCheckboxChange}
              />{" "}
              Men
            </label>
            <label>
              <input type="checkbox" /> Women
            </label>
            <label>
              <input type="checkbox" /> Kids
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
            <Link to={`/product/${index}`} key={index} className="product-link">
              <div className="product-card">
                <div className="image-placeholder">
                  <img src={product.img} alt={product.img} />
                </div>
                <div>{product.name}</div>
                <div className="product-actions">
                  <span>💖</span>
                  <span>🔗</span>
                  <span>🛒</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile section */}
      {showProfile && (
        <div className="profile-section">
          <div className="profile-details">
            <p className="username">John Doe</p>
            <br></br>
            <p>Email: johndoe@example.com</p>
            <br></br>
            <p>Member since: Jan 2021</p>
            <br></br>
            <p>Total Orders: 25</p>
            <br></br>
            <p>Items Added to Rent: 5</p>
            <br></br>
            <button
              className="switch-account"
              onClick={() => navigate("/login")}
            >
              Switch Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
