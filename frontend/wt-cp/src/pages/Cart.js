// // src/components/ShoppingCart.js
// import React, { useState } from "react";

// const ShoppingCart = () => {
//   const [quantity1, setQuantity1] = useState(1);
//   const [days1, setDays1] = useState(1);
//   const [quantity2, setQuantity2] = useState(1);
//   const [days2, setDays2] = useState(1);

//   // Prices for individual products
//   const price1 = 50; // price for product 1
//   const price2 = 75; // price for product 2

//   // Function to calculate total price for product 1
//   const calculateTotalPrice1 = () => {
//     return price1 * quantity1 * days1;
//   };

//   // Function to calculate total price for product 2
//   const calculateTotalPrice2 = () => {
//     return price2 * quantity2 * days2;
//   };

//   // Generate dropdown options for quantity and days (1-10 for quantity, 1-30 for days)
//   const generateOptions = (max) => {
//     return [...Array(max).keys()].map((num) => (
//       <option key={num + 1} value={num + 1}>
//         {num + 1}
//       </option>
//     ));
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.heading}>Shopping Cart</h2>

//       {/* Cart Item 1 */}
//       <div style={styles.cartItem}>
//         <div style={styles.imagePlaceholder}></div>
//         <div style={styles.itemDetails}>
//           <p style={styles.productName}>Product 1</p>

//           <p style={styles.productDetails}>Size: __</p>
//           <p style={styles.productDetails}>Color: __</p>

//           <p style={styles.productDetails}>Price: ${price1}/day</p>

//           <p style={styles.productDetails}>
//             Quantity:
//             <select
//               style={styles.dropdown}
//               value={quantity1}
//               onChange={(e) => setQuantity1(parseInt(e.target.value))}
//             >
//               {generateOptions(10)}
//             </select>
//           </p>

//           <p style={styles.productDetails}>
//             No. of Days:
//             <select
//               style={styles.dropdown}
//               value={days1}
//               onChange={(e) => setDays1(parseInt(e.target.value))}
//             >
//               {generateOptions(30)}
//             </select>
//           </p>

//           <p style={styles.totalPrice}>
//             Total Price: ${calculateTotalPrice1()}
//           </p>
//         </div>
//       </div>

//       {/* Cart Item 2 */}
//       <div style={styles.cartItem}>
//         <div style={styles.imagePlaceholder}></div>
//         <div style={styles.itemDetails}>
//           <p style={styles.productName}>Product 2</p>

//           <p style={styles.productDetails}>Size: __</p>
//           <p style={styles.productDetails}>Color: __</p>

//           <p style={styles.productDetails}>Price: ${price2}/day</p>

//           <p style={styles.productDetails}>
//             Quantity:
//             <select
//               style={styles.dropdown}
//               value={quantity2}
//               onChange={(e) => setQuantity2(parseInt(e.target.value))}
//             >
//               {generateOptions(10)}
//             </select>
//           </p>

//           <p style={styles.productDetails}>
//             No. of Days:
//             <select
//               style={styles.dropdown}
//               value={days2}
//               onChange={(e) => setDays2(parseInt(e.target.value))}
//             >
//               {generateOptions(30)}
//             </select>
//           </p>

//           <p style={styles.totalPrice}>
//             Total Price: ${calculateTotalPrice2()}
//           </p>
//         </div>
//       </div>

//       {/* Pay Buttons */}
//       <div style={styles.buttonContainer}>
//         <button style={styles.payButton}>
//           Pay: ${calculateTotalPrice1() + calculateTotalPrice2()}
//         </button>
//         <button style={styles.advancePayButton}>
//           Pay Advance: ${(calculateTotalPrice1() + calculateTotalPrice2()) / 2}
//         </button>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     padding: "20px",
//     backgroundColor: "#F2F6FF",
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   heading: {
//     fontSize: "24px",
//     marginBottom: "20px",
//     color: "#4A4A4A",
//   },
//   cartItem: {
//     display: "flex",
//     flexDirection: "row",
//     backgroundColor: "#E6E6E6",
//     padding: "15px",
//     borderRadius: "10px",
//     marginBottom: "15px",
//     width: "90%",
//     maxWidth: "500px",
//     boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
//   },
//   imagePlaceholder: {
//     width: "80px",
//     height: "80px",
//     backgroundColor: "#DADADA",
//     borderRadius: "10px",
//     marginRight: "15px",
//   },
//   itemDetails: {
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-between",
//   },
//   productName: {
//     fontSize: "18px",
//     fontWeight: "bold",
//     marginBottom: "5px",
//     color: "#4A4A4A",
//   },
//   productDetails: {
//     fontSize: "14px",
//     color: "#4A4A4A",
//   },
//   totalPrice: {
//     fontSize: "16px",
//     fontWeight: "bold",
//     marginTop: "10px",
//     color: "#4A4A4A",
//   },
//   dropdown: {
//     marginLeft: "10px",
//     padding: "5px",
//     fontSize: "14px",
//     borderRadius: "5px",
//     border: "1px solid #C6C6C6",
//   },
//   buttonContainer: {
//     display: "flex",
//     flexDirection: "column",
//     width: "90%",
//     maxWidth: "500px",
//     marginTop: "20px",
//   },
//   payButton: {
//     padding: "15px",
//     backgroundColor: "#D3DAF1",
//     border: "none",
//     borderRadius: "10px",
//     color: "#4A4A4A",
//     marginBottom: "10px",
//     fontSize: "16px",
//     cursor: "pointer",
//     textAlign: "center",
//     transition: "background-color 0.3s",
//   },
//   advancePayButton: {
//     padding: "15px",
//     backgroundColor: "#C6C6C6",
//     border: "none",
//     borderRadius: "10px",
//     color: "#4A4A4A",
//     fontSize: "16px",
//     cursor: "pointer",
//     textAlign: "center",
//     transition: "background-color 0.3s",
//   },
// };

// export default ShoppingCart;

import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../components/navBar";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      try {
        // Fetch products from the API
        const productResponse = await axios.get(
          "http://127.0.0.1:3001/api/v1/products",
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );

        setProducts(productResponse.data.data.products);

        // Fetch user's cart items from the API
        const cartResponse = await axios.get(
          `http://127.0.0.1:3001/api/v1/users/${localStorage.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.jwtToken}`,
            },
          }
        );
        console.log(cartResponse.data.data.user.cartitems);
        setCartItems(cartResponse.data.data.user.cartitems);
      } catch (error) {
        console.error("Error fetching cart or products:", error);
      }
    };

    fetchCartAndProducts();
  }, []);

  // Calculate the total price for a single product
  const calculateTotalPrice = (product, quantity, days) => {
    return product.cost_per_day * quantity * days;
  };

  // Generate dropdown options for quantity and days (1-10 for quantity, 1-30 for days)
  const generateOptions = (max) => {
    return [...Array(max).keys()].map((num) => (
      <option key={num + 1} value={num + 1}>
        {num + 1}
      </option>
    ));
  };

  // Initialize total price and pay advance for the cart
  let totalPrice = 0;

  return (
    <>
      {/* <NavBar /> */}
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
    </>
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
  cartItem: {
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
  payButton: {
    padding: "15px",
    backgroundColor: "#D3DAF1",
    border: "none",
    borderRadius: "10px",
    color: "#4A4A4A",
    marginBottom: "10px",
    fontSize: "16px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background-color 0.3s",
  },
  advancePayButton: {
    padding: "15px",
    backgroundColor: "#C6C6C6",
    border: "none",
    borderRadius: "10px",
    color: "#4A4A4A",
    fontSize: "16px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background-color 0.3s",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

export default ShoppingCart;
