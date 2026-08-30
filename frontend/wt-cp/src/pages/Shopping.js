import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Shopping.css";
import NavBar from "../components/navBar";
import { isAuthenticated } from "../components/ProtectedRoutes";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"; // unfilled heart
import {
  faHeart as fasHeart,
  faCartShopping,
  faBars, // Hamburger icon
  faChevronDown,
  faShieldHalved,
  faSprayCanSparkles,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import {
  GARMENT_TYPES_BY_CATEGORY,
  NON_GARMENT_SUBCATEGORIES,
} from "../constants/garmentTypes";

// Kids are filtered by age, not size, since parents shop by age — the
// `size` field on a kids product stores one of these bands instead of a
// clothing size.
const KIDS_AGE_BANDS = ["0-2", "3-5", "6-9", "10-14"];

// Sizing anxiety is the top cause of rental cart abandonment, so surface a
// quick fit reference on the card itself instead of making shoppers dig for
// it. Kids items show their age band (via `size`) instead — see below.
const FIT_NOTE_BY_CATEGORY = {
  women: "Fits 5'2\"–5'6\"",
  men: "Fits 5'7\"–5'11\"",
};

function getCardNote(product) {
  if (product.category === "kids") {
    return product.size ? `Age ${product.size} yrs` : null;
  }
  if (NON_GARMENT_SUBCATEGORIES.includes(product.sub_category)) return null;
  return FIT_NOTE_BY_CATEGORY[product.category] || null;
}

const TRUST_POINTS = [
  {
    icon: faSprayCanSparkles,
    title: "Sanitized before every rental",
    text: "Steam-cleaned and inspected after each return, before it ships to you.",
  },
  {
    icon: faShieldHalved,
    title: "Accidental damage covered",
    text: "Minor wear and small repairs are on us — no fuss, no forms.",
  },
  {
    icon: faReceipt,
    title: "No hidden deposits",
    text: "The price you see is the price you pay. No surprise security holds.",
  },
];

function App() {
  const [products, setProducts] = useState([]);
  const [likeditems, setlikeditems] = useState([]);
  const [cartitems, setCartitems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedAgeBands, setSelectedAgeBands] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false); // State to manage filter visibility
  const [rentalDates, setRentalDates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rentalDates"));
      return saved || { start: "", end: "" };
    } catch {
      return { start: "", end: "" };
    }
  });
  const location = useLocation();
  const navigate = useNavigate();

  const showsKids = selectedCategories.includes("kids");

  // The garment list only makes sense once an audience is picked — a
  // sherwani and a gown don't belong in the same dropdown, so union the
  // lists of whichever audiences are currently checked.
  const visibleGarmentTypes = [
    ...new Set(
      selectedCategories.flatMap((cat) => GARMENT_TYPES_BY_CATEGORY[cat] || [])
    ),
  ];

  const buildURL = useCallback(() => {
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
    if (showsKids && selectedAgeBands.length !== 0) {
      selectedAgeBands.forEach((value) => {
        baseURL += `size=${value}&`;
      });
    }
    return baseURL;
  }, [selectedCategories, selectedSubCategories, selectedAgeBands, showsKids]);

  const handleDateChange = (field) => (e) => {
    setRentalDates((prev) => {
      const next = { ...prev, [field]: e.target.value };
      localStorage.setItem("rentalDates", JSON.stringify(next));
      return next;
    });
  };

  const ageBandHandler = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedAgeBands((prev) => [...prev, value]);
    } else {
      setSelectedAgeBands((prev) => prev.filter((band) => band !== value));
    }
  };

  useEffect(() => {
    const getProducts = async () => {
      const tempURL = buildURL();
      try {
        const response = await axios.get(tempURL);
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

    // Liked/cart state is only relevant for a signed-in shopper.
    if (!isAuthenticated()) {
      setlikeditems([]);
      setCartitems([]);
      return;
    }

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
  }, [location.pathname, buildURL]);

  const likeAndUnlike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const productId = e.currentTarget.getAttribute("data-id");

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
      setlikeditems((prevLiked) => {
        if (prevLiked.includes(productId)) {
          return prevLiked.filter((id) => id !== productId); 
        } else {
          return [...prevLiked, productId]; 
        }
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const addCartAndRemoveCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const productId = e.currentTarget.getAttribute("data-id");

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
      setCartitems((prevCart) => {
        if (prevCart.includes(productId)) {
          return prevCart.filter((id) => id !== productId); 
        } else {
          return [...prevCart, productId]; 
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

  const scrollToProducts = () => {
    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="app-container">
      <NavBar />

      <section className="shop-hero">
        <div className="shop-hero-inner">
          <span className="chip chip-butter shop-hero-eyebrow">✨ New arrivals every week</span>
          <h1>
            Rent the look.<br />
            <span className="shop-hero-accent">Skip the closet clutter.</span>
          </h1>
          <p>
            Designer fits, delivered to your door — worn once, loved forever,
            priced like a treat.
          </p>

          <div className="date-picker-bar" role="group" aria-label="Select rental dates">
            <div className="date-picker-field">
              <label htmlFor="rental-start">Pick up</label>
              <input
                id="rental-start"
                type="date"
                min={today}
                value={rentalDates.start}
                onChange={handleDateChange("start")}
              />
            </div>
            <span className="date-picker-divider" aria-hidden="true">→</span>
            <div className="date-picker-field">
              <label htmlFor="rental-end">Return</label>
              <input
                id="rental-end"
                type="date"
                min={rentalDates.start || today}
                value={rentalDates.end}
                onChange={handleDateChange("end")}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary date-picker-cta"
              onClick={scrollToProducts}
            >
              See what's free
            </button>
          </div>

          <div className="shop-hero-stats">
            <div>
              <strong>500+</strong>
              <span>Curated pieces</span>
            </div>
            <div>
              <strong>4.8★</strong>
              <span>Shopper rating</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>Fast delivery</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="scroll-cue"
          onClick={scrollToProducts}
          aria-label="Scroll to products"
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
      </section>

      <section className="trust-bar" aria-label="Why shoppers trust ClosetSwap">
        {TRUST_POINTS.map((point) => (
          <div className="trust-item" key={point.title}>
            <FontAwesomeIcon icon={point.icon} className="trust-icon" />
            <div>
              <strong>{point.title}</strong>
              <span>{point.text}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="main-content" id="products-section">
        <div className={`filter-section ${filterOpen ? 'open' : ''}`}>
          <h3>Filters</h3>
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

          {showsKids && (
            <div className="filter-group kids-pitch">
              <p className="kids-pitch-text">
                🧒 They'll outgrow it in about 4 months anyway — rent instead
                of buying another size.
              </p>
              <h4>Age</h4>
              {KIDS_AGE_BANDS.map((band) => (
                <label key={band}>
                  <input
                    type="checkbox"
                    value={band}
                    onChange={ageBandHandler}
                  />{" "}
                  {band} yrs
                </label>
              ))}
            </div>
          )}

          {visibleGarmentTypes.length > 0 && (
            <div className="filter-group">
              <h4>Garment type</h4>
              {visibleGarmentTypes.map((type) => (
                <label key={type}>
                  <input
                    type="checkbox"
                    value={type}
                    onChange={subCategoryHandler}
                  />{" "}
                  {type}
                </label>
              ))}
            </div>
          )}

          <div className="filter-group">
            <h4>Subcategories</h4>
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
        </div>

        <div className="content-area">
          <div className="content-toolbar">
            <button
              type="button"
              className={`filter-toggle-btn ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FontAwesomeIcon icon={faBars} />
              Filters
            </button>
            <span className="results-count">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🧥</div>
              <h3>No products match yet</h3>
              <p>Try adjusting your filters or check back soon for new arrivals.</p>
            </div>
          ) : (
          <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-link" key={index}>
              <div
                className="product-card"
                style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
              >
                <Link to={`/product/${product._id}`} className="product-link">
                  <div className="image-placeholder">
                    <img src={product.img} alt={product.img} />
                    <div className="quick-actions">
                      <button
                        type="button"
                        className="quick-icon-btn"
                        data-id={product._id}
                        onClick={likeAndUnlike}
                        aria-label="Like"
                      >
                        <FontAwesomeIcon
                          icon={likeditems.includes(product._id) ? fasHeart : farHeart}
                          style={{
                            color: likeditems.includes(product._id) ? "#f43f7a" : "#9b94a6",
                          }}
                        />
                      </button>
                      <button
                        type="button"
                        className="quick-icon-btn"
                        data-id={product._id}
                        onClick={addCartAndRemoveCart}
                        aria-label="Add to cart"
                      >
                        <FontAwesomeIcon
                          icon={faCartShopping}
                          style={{
                            color: cartitems.includes(product._id) ? "#2f8a68" : "#9b94a6",
                          }}
                        />
                      </button>
                    </div>
                    <span className="quick-view-pill">Quick View</span>
                  </div>
                  <div className="row p10">
                    <div>{product.name}</div>
                    <div>₹ {product.cost_per_day}</div>
                  </div>
                  {getCardNote(product) && (
                    <div className="product-card-note">{getCardNote(product)}</div>
                  )}
                </Link>
              </div>
            </div>
          ))}
          </div>
          )}
        </div>
      </div>

      <section className="customer-photos" aria-label="Customers wearing ClosetSwap rentals">
        <h2>Real fits, real events</h2>
        <p className="customer-photos-subtext">
          No studio shots — this is what our rentals actually look like out
          in the world.
        </p>
        {/* Placeholder tiles until real shopper-submitted photos are wired
            up — swap for an actual UGC gallery, not staged/studio images. */}
        <div className="customer-photos-grid">
          {[
            { emoji: "💍", caption: "Sangeet night" },
            { emoji: "🎓", caption: "College farewell" },
            { emoji: "🎉", caption: "Birthday brunch" },
            { emoji: "🥻", caption: "Festive puja" },
          ].map((item) => (
            <div className="customer-photo-card" key={item.caption}>
              <div className="customer-photo-placeholder">{item.emoji}</div>
              <span>{item.caption}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
