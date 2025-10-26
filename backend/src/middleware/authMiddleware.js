import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/redisUtils.js";
import { User } from "../models/index.js";

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
        
        // Fetch fresh user data from database to ensure we have latest companyId
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role', 'companyId']
        });
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message: "Token is not valid"});
    }
};
