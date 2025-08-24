import express from "express";
import {login, register} from "../controllers/authController.js";

const router = express.Router();

//Routes
router.post("/register", register); // Optional register for admin creation
router.post("/login", login);

export default router;