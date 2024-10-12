// // src/components/ProductCard.js
// import React from 'react';
// import { FaHeart, FaShareAlt, FaShoppingCart } from 'react-icons/fa';

// const ProductCard = () => {
//   return (
//     <div style={styles.cardContainer}>
//       {/* Image placeholder */}
//       <div style={styles.imageContainer}>
//         <div style={styles.iconContainer}>
//           <FaHeart style={styles.icon} />
//           <FaShareAlt style={styles.icon} />
//           <FaShoppingCart style={styles.icon} />
//         </div>
//       </div>

//       {/* Product Information */}
//       <div style={styles.productInfo}>
//         <p style={styles.productName}>Product name</p>
//         <p style={styles.price}>Price: __ /day</p>
//       </div>

//       {/* Description */}
//       <div style={styles.descriptionBox}>
//         <p>Description</p>
//       </div>

//       {/* Contact Owner Button */}
//       <div style={styles.contactButtonContainer}>
//         <button style={styles.contactButton}>
//           <span style={styles.buttonIcon}></span> Contact Owner
//         </button>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   cardContainer: {
//     width: '90vw',  // Responsive width
//     maxWidth: '400px', // Limit max width on larger screens
//     padding: '20px',
//     backgroundColor: '#fff',
//     borderRadius: '20px',
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     backgroundColor: '#FFE6F7',
//     border: '2px solid #F5BFD7',
//     margin: '20px auto', // Center the card with auto margin
//   },
//   imageContainer: {
//     width: '100%',
//     height: '200px',
//     backgroundColor: '#DADADA', // Image placeholder color
//     borderRadius: '15px',
//     position: 'relative',
//     marginBottom: '15px',
//   },
//   iconContainer: {
//     position: 'absolute',
//     bottom: '10px',
//     left: '10px',
//     display: 'flex',
//     gap: '10px',
//   },
//   icon: {
//     fontSize: '16px',
//     color: '#6B728E',
//   },
//   productInfo: {
//     width: '100%',
//     textAlign: 'left',
//     marginBottom: '15px',
//   },
//   productName: {
//     fontWeight: 'bold',
//     fontSize: '1.2rem',  
//     color: '#4A4A4A',
//   },
//   price: {
//     fontSize: '1rem',
//     color: '#4A4A4A',
//   },
//   descriptionBox: {
//     width: '100%',
//     backgroundColor: '#FFD3E3', // Light pink for description box
//     padding: '15px',
//     borderRadius: '10px',
//     textAlign: 'center',
//     color: '#4A4A4A',
//     marginBottom: '20px',
//     fontSize: '1rem', // Responsive font size
//   },
//   contactButtonContainer: {
//     width: '100%',
//   },
//   contactButton: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     padding: '12px',
//     backgroundColor: '#DADADA',
//     color: '#4A4A4A',
//     borderRadius: '10px',
//     border: 'none',
//     cursor: 'pointer',
//     fontSize: '1rem',  // Adjust font size for responsiveness
//     transition: 'background-color 0.3s',
//   },
//   buttonIcon: {
//     width: '15px',
//     height: '15px',
//     backgroundColor: '#6B728E',
//     borderRadius: '50%',
//     marginRight: '10px',
//   },
// };

// // Media Queries for responsiveness
// const mediaQueries = `
//   @media (min-width: 768px) {
//     .cardContainer {
//       width: 70vw;
//       max-width: 500px;
//     }

//     .productName {
//       font-size: 1.5rem;
//     }

//     .price, .descriptionBox, .contactButton {
//       font-size: 1.2rem;
//     }
//   }

//   @media (min-width: 1024px) {
//     .cardContainer {
//       width: 50vw;
//       max-width: 600px;
//     }

//     .productName {
//       font-size: 1.8rem;
//     }

//     .price, .descriptionBox, .contactButton {
//       font-size: 1.3rem;
//     }
//   }
// `;

// // Inject media queries into document head
// const styleTag = document.createElement('style');
// styleTag.innerHTML = mediaQueries;
// document.head.appendChild(styleTag);

// export default ProductCard;

























// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './ProductCard.css'; // Create a separate CSS file for styling

// const ProductCard = ({ product }) => {
//   const [size, setSize] = useState('');
//   const [color, setColor] = useState('');
//   const [date, setDate] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [availableQuantity, setAvailableQuantity] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (size && color && date) {
//       setLoading(true);
//       axios.post('/check-availability', {
//         productId: product.id,
//         size,
//         color,
//         date,
//       }).then((response) => {
//         setAvailableQuantity(response.data.availableQuantity);
//         setLoading(false);
//       }).catch(() => {
//         setLoading(false);
//       });
//     }
//   }, [size, color, date]);

//   const handleAdvancePayment = () => {
//     axios.post('/decrement-quantity', {
//       productId: product.id,
//       size,
//       color,
//       date,
//       bookedQuantity: quantity,
//     }).then(() => {
//       alert('Payment successful, quantity updated');
//     });
//   };

//   return (
//     <div className="product-card">
//       <h2 className="product-name">{product.name}</h2>
//       <p className="product-price">Price: ${product.price}</p>

//       <div className="product-options">
//         <select className="dropdown" onChange={(e) => setSize(e.target.value)}>
//           <option value="">Select Size</option>
//           {product.sizes.map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>

//         <select className="dropdown" onChange={(e) => setColor(e.target.value)}>
//           <option value="">Select Color</option>
//           {product.colors.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>

//         <input className="date-picker" type="date" onChange={(e) => setDate(e.target.value)} />
//       </div>

//       {loading ? (
//         <p className="loading-text">Checking availability...</p>
//       ) : (
//         availableQuantity !== null && (
//           <p className="available-quantity">Available Quantity: {availableQuantity}</p>
//         )
//       )}

//       <div className="product-quantity">
//         <label>Select Quantity:</label>
//         <select className="dropdown" onChange={(e) => setQuantity(e.target.value)}>
//           {[...Array(availableQuantity || 0)].map((_, i) => (
//             <option key={i + 1} value={i + 1}>{i + 1}</option>
//           ))}
//         </select>
//       </div>

//       <button className="pay-button" onClick={handleAdvancePayment}>Pay Advance</button>
//     </div>
//   );
// };

// export default ProductCard;















import React from 'react';
import { FaHeart, FaShareAlt, FaShoppingCart } from 'react-icons/fa';
import { useParams } from 'react-router-dom'; // Import useParams to access dynamic route

const ProductCard = () => {
  const { productId } = useParams(); // Access the product ID from the route

  return (
    <div style={styles.cardContainer}>
      {/* Image placeholder */}
      <div style={styles.imageContainer}>
        <div style={styles.iconContainer}>
          <FaHeart style={styles.icon} />
          <FaShareAlt style={styles.icon} />
          <FaShoppingCart style={styles.icon} />
        </div>
      </div>

      {/* Product Information */}
      <div style={styles.productInfo}>
        <p style={styles.productName}>Product {productId}</p> {/* Dynamic product name */}
        <p style={styles.price}>Price: __ /day</p>
      </div>

      {/* Description */}
      <div style={styles.descriptionBox}>
        <p>Product description for Product {productId}</p> {/* Dynamic product description */}
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
    width: '90vw',  // Responsive width
    maxWidth: '400px', // Limit max width on larger screens
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFE6F7', /* Theme color can be updated here */
    border: '2px solid #F5BFD7',
    margin: '20px auto',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    backgroundColor: '#DADADA', // Image placeholder color
    borderRadius: '15px',
    position: 'relative',
    marginBottom: '15px',
  },
  iconContainer: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    display: 'flex',
    gap: '10px',
  },
  icon: {
    fontSize: '16px',
    color: '#6B728E',
  },
  productInfo: {
    width: '100%',
    textAlign: 'left',
    marginBottom: '15px',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#4A4A4A',
  },
  price: {
    fontSize: '1rem',
    color: '#4A4A4A',
  },
  descriptionBox: {
    width: '100%',
    backgroundColor: '#FFD3E3', // Light pink for description box
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: '20px',
    fontSize: '1rem',
  },
  contactButtonContainer: {
    width: '100%',
  },
  contactButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: '#DADADA',
    color: '#4A4A4A',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  buttonIcon: {
    width: '15px',
    height: '15px',
    backgroundColor: '#6B728E',
    borderRadius: '50%',
    marginRight: '10px',
  },
};

export default ProductCard;
