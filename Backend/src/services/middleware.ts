import { Request, Response, NextFunction } from "express";
import { getUser } from "../services/auth";

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

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);
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
