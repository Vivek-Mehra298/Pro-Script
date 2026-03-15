import { Router, Request, Response } from "express";
import User from "../models/user";
import { setUser, getUser } from "../services/auth";

const router = Router();

function getTokenFromRequest(req: Request) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length).trim();
    }

    const headerToken = req.headers["x-auth-token"];
    if (typeof headerToken === "string" && headerToken.trim()) {
        return headerToken.trim();
    }

    return req.cookies?.token;
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        // Cross-site (Vercel -> Railway) needs SameSite=None + Secure in production.
        sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    };
}

router.post('/signup', async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "fullName, email and password are required" });
    }

    try {
        const newUser = await User.create({
            fullName,
            email,
            password,
        });

        const token = setUser(newUser);
        res.cookie('token', token, getCookieOptions());

        res.status(201).json({ 
            message: "User created successfully", 
            token,
            user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email } 
        });
    } catch (error: any) {
        console.error("Signup error:", error);
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Failed to create user. Please try again." });
    }
})

router.post('/signin', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = setUser(user);
        res.cookie('token', token, getCookieOptions());

        res.status(200).json({ 
            message: "Signin successful", 
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email } 
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Signin failed" });
    }
})

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token', getCookieOptions());
    res.status(200).json({ message: "Logged out successfully" });
});

router.get('/me', async (req: Request, res: Response) => {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const user = getUser(token);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    res.status(200).json({ user });
});

export default router;
