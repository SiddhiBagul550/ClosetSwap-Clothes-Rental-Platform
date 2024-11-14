import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Shopping.css";
import NavBar from "../components/navBar";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"; // unfilled heart
import {
  faHeart as fasHeart,
  faLink,
  faCartShopping,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [products, setProducts] = useState([]);
  const [likeditems, setlikeditems] = useState([]);
  const [cartitems, setCartitems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const location = useLocation();

  const buildURL = () => {
    let baseURL = "http://127.0.0.1:3001/api/v1/products?";
    if (selectedCategories.length !== 0) {
      selectedCategories.forEach((value) => {
        baseURL += `category=${value}&`;
      });
    }
    if (selectedSubCategories.length !== 0) {
      selectedSubCategories.forEach((value) => {
        baseURL += `sub_category=${value}&`;
      });
    }
    return baseURL;
  };

  useEffect(() => {
    const getProducts = async () => {
      const tempURL = buildURL();
      try {
        const response = await axios.get(tempURL, {
          headers: {
            Authorization: `Bearer ${localStorage.jwtToken}`,
          },
        });
        let data = [];
        response.data.data.products.forEach((element) => {
          if (element.available_quantity > 0) {
            data.push(element);
          }
        });
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    getProducts();

    const getUserInfo = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:3001/api/v1/users/${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setlikeditems(response.data.data.user.likeditems);
        setCartitems(response.data.data.user.cartitems);
      } catch (error) {
        console.error("Error :", error);
      }
    };
    getUserInfo();
  }, [location.pathname, selectedCategories, selectedSubCategories]);

  const likeAndUnlike = async (e) => {
    const productId = e.currentTarget.getAttribute("data-id");

    // Now make the API call to reflect the change on the server
    try {
      await axios.post(
        `http://127.0.0.1:3001/api/v1/users/like/${localStorage.userId}`,
        {
          productId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.jwtToken}`,
          },
        }
      );
      // Optimistically update the liked items before the API call
      setlikeditems((prevLiked) => {
        if (prevLiked.includes(productId)) {
          return prevLiked.filter((id) => id !== productId); // Remove if already liked
        } else {
          return [...prevLiked, productId]; // Add to liked
        }
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const addCartAndRemoveCart = async (e) => {
    const productId = e.currentTarget.getAttribute("data-id");

    // Now make the API call to reflect the change on the server
    try {
      await axios.post(
        `http://127.0.0.1:3001/api/v1/users/cart/${localStorage.userId}`,
        {
          productId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.jwtToken}`,
          },
        }
      );
      // Optimistically update the liked items before the API call
      setCartitems((prevCart) => {
        if (prevCart.includes(productId)) {
          return prevCart.filter((id) => id !== productId); // Remove if already liked
        } else {
          return [...prevCart, productId]; // Add to liked
        }
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const categoryHandler = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedCategories((prev) => [...prev, value]);
    } else {
      setSelectedCategories((prev) =>
        prev.filter((category) => category !== value)
      );
    }
  };
  const subCategoryHandler = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setSelectedSubCategories((prev) => [...prev, value]);
    } else {
      setSelectedSubCategories((prev) =>
        prev.filter((category) => category !== value)
      );
    }
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <NavBar />
      {/* Main content with filters and product grid */}
      <div className="main-content">
        {/* Filter section */}
        <aside className="filter-section">
          <h3>Filters</h3>
          <br />
          <br />
          <div className="filter-group">
            <h4>Category</h4>
            <label>
              <input type="checkbox" value="men" onChange={categoryHandler} />{" "}
              Men
            </label>
            <label>
              <input type="checkbox" value="women" onChange={categoryHandler} />{" "}
              Women
            </label>
            <label>
              <input type="checkbox" value="kids" onChange={categoryHandler} />{" "}
              Kids
            </label>
          </div>

          <div className="filter-group">
            <h4>Subcategories</h4>
            <label>
              <input
                type="checkbox"
                value="Clothing"
                onChange={subCategoryHandler}
              />{" "}
              Clothing
            </label>
            <label>
              <input
                type="checkbox"
                value="Costumes"
                onChange={subCategoryHandler}
              />{" "}
              Costumes
            </label>
            <label>
              <input
                type="checkbox"
                value="Footwear"
                onChange={subCategoryHandler}
              />{" "}
              Footwear
            </label>
            <label>
              <input
                type="checkbox"
                value="Accessories"
                onChange={subCategoryHandler}
              />{" "}
              Accessories
            </label>
          </div>
        </aside>

        {/* Product grid */}
        <div className="product-grid">
          {products.length === 0 ? <h2>No data available....</h2> : ""}
          {products.map((product, index) => (
            <div className="product-link" key={index}>
              <div className="product-card">
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="image-placeholder">
                    <img src={product.img} alt={product.img} />
                  </div>
                  <div className="row p10">
                    <div>{product.name}</div>
                    <div>₹ {product.cost_per_day}</div>
                  </div>
                </Link>
                <div className="row">
                  <span data-id={product._id} onClick={likeAndUnlike}>
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
                  {/* <span>
                    <FontAwesomeIcon icon={faLink} />
                  </span> */}
                  <span data-id={product._id} onClick={addCartAndRemoveCart}>
                    <FontAwesomeIcon
                      icon={
                        cartitems.includes(product._id)
                          ? faCartShopping
                          : faCartShopping
                      }
                      style={{
                        color: cartitems.includes(product._id)
                          ? "green"
                          : "black",
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
