const express = require("express");

const router = express.Router();

const productsController = require("./../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct);

  router
  .route("/:id")
  .get(productsController.getProductsById)
  .delete(productsController.deleteProduct)
  .patch(productsController.updateProduct)

module.exports = router;
