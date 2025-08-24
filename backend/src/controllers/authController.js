import User from "../models/User.js";
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
    const {email, password} = req.body;
    try {
        const user = await User.findOne({where: {email}});
        if(!user) return res.status(404).json({message:"User not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(404).json({message: "Invalid Credentials"});

        const token = jwt.sign(
            {id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );
        
        res.status({token, user: {id: user.id, name: user.name, email: user.email, role: user.role}});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

