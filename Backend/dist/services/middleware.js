"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const auth_1 = require("../services/auth");
const checkAuth = (req, res, next) => {
    const token = req.cookies?.token;
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