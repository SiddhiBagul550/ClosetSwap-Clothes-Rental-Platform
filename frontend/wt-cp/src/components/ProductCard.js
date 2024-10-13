import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaHeart, FaShareAlt, FaShoppingCart } from "react-icons/fa";
import { useParams } from "react-router-dom"; // Import useParams to access dynamic route

const ProductCard = () => {
  const { productId } = useParams(); // Access the product ID from the route
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
    <div style={styles.cardContainer}>
      {/* Image placeholder */}
      <div style={styles.imageContainer}>
        <img style={styles.img} src={productInfo.img} alt="Img here" />
        <div style={styles.iconContainer}>
          <FaHeart style={styles.icon} />
          <FaShareAlt style={styles.icon} />
          <FaShoppingCart style={styles.icon} />
        </div>
      </div>

      {/* Product Information */}
      <div style={styles.productInfo}>
        <p style={styles.productName}>
          {productInfo.name} {productId}
        </p>{" "}
        {/* Dynamic product name */}
        <p style={styles.price}>Price: ₹ {productInfo.cost_per_day} /day</p>
      </div>

      {/* Description */}
      <div style={styles.descriptionBox}>
        <p>Product description for Product {productId}</p>{" "}
        {/* Dynamic product description */}
      </div>

      {/* Contact Owner Button */}
      <div style={styles.contactButtonContainer}>
        <button style={styles.contactButton}>
          <span style={styles.buttonIcon}></span> Contact Owner
        </button>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    width: "90vw", // Responsive width
    maxWidth: "400px", // Limit max width on larger screens
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#FFE6F7" /* Theme color can be updated here */,
    border: "2px solid #F5BFD7",
    margin: "20px auto",
  },
  imageContainer: {
    width: "100%",
    height: "200px",
    backgroundColor: "#DADADA", // Image placeholder color
    borderRadius: "15px",
    position: "relative",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    display: "flex",
    gap: "10px",
  },
  icon: {
    fontSize: "16px",
    color: "#6B728E",
  },
  productInfo: {
    width: "100%",
    textAlign: "left",
    marginBottom: "15px",
  },
  productName: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "#4A4A4A",
  },
  price: {
    fontSize: "1rem",
    color: "#4A4A4A",
  },
  descriptionBox: {
    width: "100%",
    backgroundColor: "#FFD3E3", // Light pink for description box
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#4A4A4A",
    marginBottom: "20px",
    fontSize: "1rem",
  },
  contactButtonContainer: {
    width: "100%",
  },
  contactButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "12px",
    backgroundColor: "#DADADA",
    color: "#4A4A4A",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
  },
  buttonIcon: {
    width: "15px",
    height: "15px",
    backgroundColor: "#6B728E",
    borderRadius: "50%",
    marginRight: "10px",
  },
  img: {},
};

export default ProductCard;
