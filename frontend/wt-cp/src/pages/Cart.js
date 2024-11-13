import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/navBar";
import Modal from "react-modal";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [rentalDays, setRentalDays] = useState({});
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
      alert("Failed to send the message. Please try again later.");
    }
  };

  return (
    <>
      <NavBar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Cart</h2>
        {products.map((product, index) => {
          return cartItems.includes(product._id) ? (
            <div style={styles.cartItem} key={index}>
              <div style={styles.imagePlaceholder}>
                <img src={product.img} alt={product.img} style={styles.image} />
              </div>
              <div style={styles.itemDetails}>
                <p style={styles.productName}>{product.name}</p>
                <p style={styles.productDetails}>Size: {product.size}</p>
                <p style={styles.productDetails}>Available quantities: {product.available_quantity}</p>
                <p style={styles.productDetails}>Price: ₹{product.cost_per_day}/day</p>

                <div style={styles.productDetails}>
                  <label>Quantity: </label>
                  <select
                    value={quantities[product._id] || 1}
                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                    style={styles.dropdown}
                  >
                    {generateOptions(Math.min(product.available_quantity, 10))}
                  </select>
                </div>

                <div style={styles.productDetails}>
                  <label>Days: </label>
                  <select
                    value={rentalDays[product._id] || 1}
                    onChange={(e) => handleRentalDaysChange(product._id, e.target.value)}
                    style={styles.dropdown}
                  >
                    {generateOptions(30)}
                  </select>
                </div>

                <button
                  style={styles.contactButton}
                  onClick={() => openContactModal(product)}
                >
                  Contact Owner
                </button>
              </div>
            </div>
          ) : null;
        })}

        {/* Contact Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={modalStyles}
          contentLabel="Contact Owner Modal"
        >
          <h2>Contact Owner</h2>
          <p>Send a message to the owner of {selectedProduct?.name}</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.messageInput}
            placeholder="Enter your message here..."
          />
          <button onClick={handleSendMessage} style={styles.sendButton}>
            Send Message
          </button>
          <button onClick={closeModal} style={styles.cancelButton}>
            Cancel
          </button>
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

const styles = {
  container: { /* your styles */ },
  contactButton: {
    marginTop: "10px",
    padding: "8px 12px",
    fontSize: "14px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  messageInput: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  sendButton: {
    padding: "10px 15px",
    fontSize: "14px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  cancelButton: {
    padding: "10px 15px",
    fontSize: "14px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

const modalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    width: "400px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};

export default ShoppingCart;
