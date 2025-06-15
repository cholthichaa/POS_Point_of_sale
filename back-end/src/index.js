"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db"); // import pool จาก config/db.ts
require("./models/initDB");
const auth_1 = __importDefault(require("./routes/auth"));
// import userRoutes from './routes/user';
const cashierRoutes_1 = __importDefault(require("./routes/cashierRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const zonesRoutes_1 = __importDefault(require("./routes/zonesRoutes"));
const tableRoutes_1 = __importDefault(require("./routes/tableRoutes"));
const menusRoutes_1 = __importDefault(require("./routes/menusRoutes"));
const ordersRoutes_1 = __importDefault(require("./routes/ordersRoutes"));
const orderItemsRoutes_1 = __importDefault(require("./routes/orderItemsRoutes"));
const billsRoutes_1 = __importDefault(require("./routes/billsRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
}));
app.get('/api/test-db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield db_1.pool.connect();
        const result = yield client.query('SELECT NOW()');
        client.release();
        res.json({ serverTime: result.rows[0].now });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
}));
app.get('/', (req, res) => {
    res.send('Welcome to Backend Server!');
});
app.use('/api/auth', auth_1.default);
app.use('/api/cashiers', authMiddleware_1.authMiddleware, cashierRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/zones', zonesRoutes_1.default);
app.use('/api/table', tableRoutes_1.default);
app.use('/api/menus', menusRoutes_1.default);
app.use('/api/order', ordersRoutes_1.default);
app.use('/api/order_items', orderItemsRoutes_1.default);
app.use('/api/bills', billsRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error Handler:', err);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
