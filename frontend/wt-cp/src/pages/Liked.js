// src/components/Liked.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Liked = () => {
  const price1 = 50; // price for product 1
  const [products, setProducts] = useState([]);
  const [likeditems, setlikeditems] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3001/api/v1/products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        setProducts(response.data.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }

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
      } catch (error) {
        console.error("Error :", error);
      }
    };
    getData();
  }, []);

  return (
    <div style={styles.container}>
      s<h2 style={styles.heading}>Liked Items</h2>
      {products.map((product, index) => {
        return likeditems.includes(product._id) ? (
          <div style={styles.likedItem} key={index}>
            <div style={styles.imagePlaceholder}>
              <img src={product.img} alt={product.img} style={styles.image} />
            </div>
            <div style={styles.itemDetails}>
              <p style={styles.productName}>{product.name}</p>
              <p style={styles.productDetails}>Size: {product.size}</p>

              <p style={styles.productDetails}>
                Available quantities: {product.available_quantity}
              </p>
              <p style={styles.productDetails}>
                Price: ₹{product.cost_per_day}/day
              </p>
            </div>
          </div>
        ) : null; // Returning null when the product is not liked
      })}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#F2F6FF",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#4A4A4A",
  },
  likedItem: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#E6E6E6",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  },
  imagePlaceholder: {
    width: "80px",
    height: "80px",
    backgroundColor: "#DADADA",
    borderRadius: "10px",
    marginRight: "15px",
  },
  itemDetails: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  productName: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#4A4A4A",
  },
  productDetails: {
    fontSize: "14px",
    color: "#4A4A4A",
  },
  totalPrice: {
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
    color: "#4A4A4A",
  },
  dropdown: {
    marginLeft: "10px",
    padding: "5px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #C6C6C6",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    width: "90%",
    maxWidth: "500px",
    marginTop: "20px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

export default Liked;
