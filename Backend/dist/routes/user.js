"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../services/auth");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "fullName, email and password are required" });
    }
    try {
        const newUser = await user_1.default.create({
            fullName,
            email,
            password,
        });
        const token = (0, auth_1.setUser)(newUser);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            message: "User created successfully",
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email }
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Failed to create user. Please try again." });
    }
});
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = (0, auth_1.setUser)(user);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: "Signin successful",
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Signin failed" });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
});
router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const user = (0, auth_1.getUser)(token);
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    res.status(200).json({ user });
});
exports.default = router;
//# sourceMappingURL=user.js.map