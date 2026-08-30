import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/navBar";
import Modal from "react-modal";
import "../css/ItemList.css";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [rentalDays, setRentalDays] = useState({});
  const [startDate, setStartDate] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      try {
        const productResponse = await axios.get(
          "http://127.0.0.1:3001/api/v1/products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );

        setProducts(productResponse.data.data.products);

        const cartResponse = await axios.get(
          `http://127.0.0.1:3001/api/v1/users/${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setCartItems(cartResponse.data.data.user.cartitems);

        // Set default start dates to today
        const currentDate = new Date().toISOString().split("T")[0];
        const initialStartDates = cartResponse.data.data.user.cartitems.reduce(
          (acc, item) => ({ ...acc, [item]: currentDate }),
          {}
        );
        setStartDate(initialStartDates);
      } catch (error) {
        console.error("Error fetching cart or products:", error);
      }
    };

    fetchCartAndProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: parseInt(value) });
  };

  const handleRentalDaysChange = (productId, value) => {
    setRentalDays({ ...rentalDays, [productId]: parseInt(value) });
  };

  const handleStartDateChange = (productId, value) => {
    setStartDate({ ...startDate, [productId]: value });
  };

  const openContactModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage("");
  };

  const handleSendMessage = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:3001/api/v1/messages`,
        {
          productId: selectedProduct._id,
          userId: localStorage.userId,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.jwtToken}`,
          },
        }
      );
      alert("Message sent to the owner!");
      closeModal();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message sent.");
    }
  };

  const removeItem = async (e) => {
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
    } catch (error) {
      console.log(error);
    }

    window.location.reload();
  };

  const cartProducts = products.filter((product) => cartItems.includes(product._id));

  return (
    <>
      <NavBar />

      <div className="list-page">
        <h2 className="page-heading">Your Cart</h2>
        <p className="page-subheading">Review your picks before you reach out to the owners.</p>

        {cartProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse the collection and add something you love.</p>
          </div>
        ) : (
          cartProducts.map((product) => (
            <div className="item-card" key={product._id}>
              <div className="item-image">
                <img src={product.img} alt={product.img} />
              </div>
              <div className="item-details">
                <p className="item-name">{product.name}</p>
                <p className="item-meta">Size: {product.size}</p>
                <p className="item-meta">Available: {product.available_quantity}</p>
                <p className="item-price">₹{product.cost_per_day}/day</p>

                <div className="item-controls">
                  <label className="item-control">
                    Qty
                    <select
                      value={quantities[product._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product._id, e.target.value)
                      }
                    >
                      {generateOptions(Math.min(product.available_quantity, 10))}
                    </select>
                  </label>

                  <label className="item-control">
                    Days
                    <select
                      value={rentalDays[product._id] || 1}
                      onChange={(e) =>
                        handleRentalDaysChange(product._id, e.target.value)
                      }
                    >
                      {generateOptions(30)}
                    </select>
                  </label>

                  <label className="item-control">
                    Start
                    <input
                      type="date"
                      value={startDate[product._id] || ""}
                      onChange={(e) =>
                        handleStartDateChange(product._id, e.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => openContactModal(product)}
                  >
                    Contact Owner
                  </button>
                  <button
                    className="btn btn-danger"
                    data-id={product._id}
                    onClick={removeItem}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Contact Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="contact-modal"
          overlayClassName="modal-overlay"
          contentLabel="Contact Owner Modal"
        >
          <h2>Contact Owner</h2>
          <p>Send a message to the owner of {selectedProduct?.name}</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
          />
          <div className="contact-modal-actions">
            <button onClick={handleSendMessage} className="btn btn-primary">
              Send Message
            </button>
            <button onClick={closeModal} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
};

const generateOptions = (max) => {
  return [...Array(max).keys()].map((num) => (
    <option key={num + 1} value={num + 1}>
      {num + 1}
    </option>
  ));
};

export default ShoppingCart;
