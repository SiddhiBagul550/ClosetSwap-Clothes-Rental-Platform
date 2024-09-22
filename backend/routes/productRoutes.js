const express = require("express");
const router = express.Router();
const productsController = require("./../controllers/productsController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protect, productsController.getAllProducts)
  .post(authController.protect, productsController.createProduct);

router
  .route("/:id")
  .get(authController.protect, productsController.getProductsById)
  .delete(authController.protect, productsController.deleteProduct)
  .patch(authController.protect, productsController.updateProduct);

module.exports = router;
