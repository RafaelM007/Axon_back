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
// Importa o middleware de upload (Multer + Cloudinary)
const upload = require("../middleware/uploadMiddleware"); 

router.use(authMiddleware);

// Permite o envio da imagem no campo 'image' via multipart/form-data
router.post("/", upload.single("image"), createTask);
router.get("/", getTasks);
router.put("/:id", upload.single("image"), updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/status", updateStatus);

module.exports = router;