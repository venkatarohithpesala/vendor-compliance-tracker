import { User, Vendor } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a User
export const register = async(req, res) => {
  const {name, email, password, role} = req.body;

  try{
    const hassedPassword = await bcrypt(password, 10);
    const user = await User.create ({name, email, password: hassedPassword, role});
    res.status(201).json({message:"User Created", user});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// Login User
export const login = async(req, res) => {
    const {email, password, rememberMe} = req.body;
    try {
        const user = await User.findOne({where: {email}});

        if(!user) {
            console.log('User not found:', email);
            return res.status(404).json({message:"User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        const token = jwt.sign(
            {id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: rememberMe ? "7d" : "1d"}
        );

        const cookieMaxAge = rememberMe
          ? 7 * 24 * 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

        // Set JWT as HTTP-only cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // use true in production
          sameSite: "strict",
          maxAge: cookieMaxAge
        });

        let userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId
        };

        // If user is a vendor, include vendorId
        if (user.role === 'vendor') {
            const vendor = await Vendor.findOne({
                where: { email: user.email },
                attributes: ['id']
            });
            if (vendor) {
                userData.vendorId = vendor.id;
            }
        }

        // Send user info only
        res.status(200).json({user: userData});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({error: error.message});
    }
};

// Check authentication status
export const checkAuth = async (req, res) => {
    try {
        // If we get here, it means the auth middleware validated the token
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'companyId']
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        let userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId
        };

        // If user is a vendor, include vendorId
        if (user.role === 'vendor') {
            const vendor = await Vendor.findOne({
                where: { email: user.email },
                attributes: ['id']
            });
            if (vendor) {
                userData.vendorId = vendor.id;
            }
        }

        return res.json({
            user: userData,
            authenticated: true
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Logout User
export const logout = async (req, res) => {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: error.message });
    }
};

