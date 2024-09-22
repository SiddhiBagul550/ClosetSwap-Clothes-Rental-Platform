const express = require("express");

const router = express.Router();

const productsController = require("./../controllers/productsController");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(productsController.createProduct);

module.exports = router;
