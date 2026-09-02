const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(authController.protect);

// Any logged-in user can ask whether *they* are an admin - it only ever
// answers about the requester, so this stays outside restrictToAdmin.
router.get("/check", adminController.checkAdmin);

router.use(authController.restrictToAdmin);

router.get("/overview", adminController.getOverview);
router.get("/shops", adminController.listShops);
router.patch("/shops/:id/verify", adminController.verifyShop);
router.patch("/shops/:id/reject", adminController.rejectShop);
router.patch("/shops/:id/revoke", adminController.revokeShop);

module.exports = router;
