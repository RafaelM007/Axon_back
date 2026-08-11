const express = require("express");
const router = express.Router();

const taskSubmissionController = require("../controllers/taskSubmissionController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Enviar evidência
router.post(
    "/",
    authMiddleware,
    upload.single("evidence"),
    taskSubmissionController.submitEvidence
);

// Minhas evidências
router.get("/my", authMiddleware, taskSubmissionController.getMySubmissions);


// Evidências pendentes para validação
router.get("/pending", authMiddleware, taskSubmissionController.getPendingValidations);


// Detalhes de uma evidência
router.get("/:id", authMiddleware, taskSubmissionController.getSubmissionById);


// Primeira validação: aprovar ou contestar
router.patch("/:id/validate", authMiddleware, taskSubmissionController.validateSubmission);


// Votar em uma contestação
router.patch("/:id/vote", authMiddleware, taskSubmissionController.voteSubmission);


module.exports = router;