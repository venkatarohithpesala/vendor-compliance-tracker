import express from "express";
import {login, register, checkAuth} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Routes
router.post("/register", register); // Optional register for admin creation
router.post("/login", login);
router.get("/check", protect, checkAuth);

export default router;