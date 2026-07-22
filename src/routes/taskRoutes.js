const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  updateStatus,
} = require("../controllers/taskController");


const authMiddleware = require("../middleware/authMiddleware");


router.use(authMiddleware);


router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/status", updateStatus);

module.exports = router;