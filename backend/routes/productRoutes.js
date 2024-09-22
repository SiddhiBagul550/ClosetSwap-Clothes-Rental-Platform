const express = require("express");

const router = express.Router();

const productsController = require("./../controllers/productsController");


router
  .route("/:category/:sub_category")
  .get(productsController.getAllProducts)
  .post(productsController.newproduct_entry);

  router
  .route("/:id")
  .get(productsController.getProductsById)
  .delete(productsController.deleteProduct)
  .patch(productsController.updateProduct)



module.exports = router;
