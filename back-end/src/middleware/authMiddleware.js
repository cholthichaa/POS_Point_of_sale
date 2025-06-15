"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'MySuperSecretKey12345';
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract token from header
    if (!token) {
        res.status(401).json({ message: 'No token provided, authorization denied' });
        return; // End execution here after sending the response
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET); // Cast to 'any' or 'User' type
        req.user = decoded; // Attach decoded user info to request
        next(); // Proceed to next middleware or route handler
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authMiddleware = authMiddleware;
