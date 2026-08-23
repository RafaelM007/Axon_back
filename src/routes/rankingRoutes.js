const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const rankingController = require("../controllers/rankingController");

router.get(
    "/groups/:groupId/ranking",
    authMiddleware,
    rankingController.getGroupRanking
);

module.exports = router;