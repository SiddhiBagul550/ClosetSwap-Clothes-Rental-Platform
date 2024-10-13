// src/components/Liked.js
import React, { useState } from 'react';

const Liked = () => {
  const [quantity1, setQuantity1] = useState(1);
  const [days1, setDays1] = useState(1);
  const [quantity2, setQuantity2] = useState(1);
  const [days2, setDays2] = useState(1);

  // Prices for individual products
  const price1 = 50; // price for product 1
  const price2 = 75; // price for product 2


  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Liked Items</h2>

      {/* liked Item 1 */}
      <div style={styles.likedItem}>
        <div style={styles.imagePlaceholder}></div>
        <div style={styles.itemDetails}>
          <p style={styles.productName}>Product 1</p>

          <p style={styles.productDetails}>Size: __</p>
          <p style={styles.productDetails}>Color: __</p>
          <p style={styles.productDetails}>Available quantities: __</p>

          <p style={styles.productDetails}>Price: ${price1}/day</p>
        </div>
      </div>

      {/* liked Item 2 */}
      <div style={styles.likedItem}>
        <div style={styles.imagePlaceholder}></div>
        <div style={styles.itemDetails}>
          <p style={styles.productName}>Product 2</p>

          <p style={styles.productDetails}>Size: __</p>
          <p style={styles.productDetails}>Color: __</p>
          <p style={styles.productDetails}>Available quantities: __</p>

          <p style={styles.productDetails}>Price: ${price2}/day</p>

        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#F2F6FF',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#4A4A4A',
  },
  likedItem: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#E6E6E6',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  imagePlaceholder: {
    width: '80px',
    height: '80px',
    backgroundColor: '#DADADA',
    borderRadius: '10px',
    marginRight: '15px',
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#4A4A4A',
  },
  productDetails: {
    fontSize: '14px',
    color: '#4A4A4A',
  },
  totalPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    color: '#4A4A4A',
  },
  dropdown: {
    marginLeft: '10px',
    padding: '5px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #C6C6C6',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    maxWidth: '500px',
    marginTop: '20px',
  },
};

export default Liked;
