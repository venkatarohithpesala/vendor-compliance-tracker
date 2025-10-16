import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/redisUtils.js";

export const protect = async (req, res, next) => {
    // Get token from cookie
    const token = req.cookies?.token;
    if(!token) return res.status(401).json({message: "No token, authorization denied"});

    try {
        // Check if token is blacklisted
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token has been revoked" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: "Token is not valid"});
    }
};
