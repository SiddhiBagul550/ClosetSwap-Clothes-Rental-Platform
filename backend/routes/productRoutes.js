const express = require("express");

const router = express.Router();

const productsController = require("./../controllers/productsController");

const getAllMenProducts = (req, res) => {
  res.send("This is men product page");
};

const getAllWomenProducts = (req, res) => {
  res.send("This is women product page");
};

const getAllKidsProducts = (req, res) => {
  res.send("This is kids product page");
};

router
  .route("/:category/:sub_category")
  .get(productsController.getAllProducts)
  .post(productsController.newproduct_entry);

router.route("/women/clothing").get(getAllWomenProducts);

router.route("/kids/clothing").get(getAllKidsProducts);

// router.route('/:category/:cat')

module.exports = router;
