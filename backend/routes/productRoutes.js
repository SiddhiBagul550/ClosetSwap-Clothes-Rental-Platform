const express = require("express");
const router = express.Router();
const productsController = require("./../controllers/productsController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(authController.protect, authController.requireEmailVerified, productsController.createProduct);

router
  .route("/:id")
  .get(productsController.getProductsById)
  .delete(authController.protect, authController.requireEmailVerified, productsController.deleteProduct)
  .patch(authController.protect, authController.requireEmailVerified, productsController.updateProduct);

module.exports = router;
