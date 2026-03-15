"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.setUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET || 'fallback-secret';
const setUser = (user) => {
    const payload = {
        id: user?._id?.toString() ?? user?._id,
        email: user?.email,
        role: user?.role,
        fullName: user?.fullName
    };
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '7d' });
};
exports.setUser = setUser;
const getUser = (token) => {
    if (!token)
        return null;
    try {
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    catch (error) {
        return null;
    }
};
exports.getUser = getUser;
//# sourceMappingURL=auth.js.map