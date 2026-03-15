"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const auth_1 = require("../services/auth");
function getTokenFromRequest(req) {
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
const checkAuth = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }
    const user = (0, auth_1.getUser)(token);
    if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=middleware.js.map