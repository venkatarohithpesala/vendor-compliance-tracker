import express from "express";
import {login, register} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//Routes
router.post("/register", register); // Optional register for admin creation
router.post("/login", login);
router.get("/check", protect, (req, res) => {res.status(200).json({ authenticated: true, user: req.user });}); // Auth check route

export default router;