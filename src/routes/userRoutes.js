const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);

router.patch(
    "/profile-image",
    authMiddleware,
    upload.single("profileImage"),
    userController.updateProfileImage
);


router.patch(
    "/change-password",
    authMiddleware,
    userController.changePassword
);

module.exports = router;