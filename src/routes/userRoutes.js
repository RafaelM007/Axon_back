const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/me", authMiddleware, userController.getProfile);



module.exports = router;