import { Request, Response, NextFunction } from "express";
import { getUser } from "../services/auth";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const user = getUser(token);
    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    (req as any).user = user;
    next();
};
