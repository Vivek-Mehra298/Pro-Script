"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const user_1 = __importDefault(require("./routes/user"));
const blog_1 = __importDefault(require("./routes/blog"));
const video_1 = __importDefault(require("./routes/video"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pro-script";
const MONGO_URI_FALLBACK = process.env.MONGODB_URI_FALLBACK;
const MONGODB_CONNECT_TIMEOUT_MS = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 15000);
function redactMongoUri(uri) {
    try {
        const url = new URL(uri);
        return `${url.protocol}//${url.host}${url.pathname}`;
    }
    catch {
        return "mongodb://<redacted>";
    }
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function parseOriginRule(raw) {
    const value = raw.trim();
    if (value.startsWith("*.")) {
        return { type: "wildcard_suffix", suffix: value.slice(1) };
    }
    return { type: "exact", value };
}
const allowedOriginRules = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .map(parseOriginRule);
function isOriginAllowed(origin) {
    return allowedOriginRules.some((rule) => {
        if (rule.type === "exact")
            return origin === rule.value;
        return origin.endsWith(rule.suffix);
    });
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (isOriginAllowed(origin))
            return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/', (req, res) => {
    res.send("ProScript API is running");
});
app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        mongoReadyState: mongoose_1.default.connection.readyState,
    });
});
app.use('/user', user_1.default);
app.use('/blog', blog_1.default);
app.use('/api/videos', video_1.default);
// 404 Handler
app.use((req, res) => {
    console.log(`[404] Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});
async function startServer() {
    try {
        const candidateUris = [MONGO_URI, MONGO_URI_FALLBACK].filter(Boolean);
        let lastError = undefined;
        for (let i = 0; i < candidateUris.length; i++) {
            const uri = candidateUris[i];
            try {
                console.log(`Connecting to MongoDB (attempt ${i + 1}/${candidateUris.length}) at ${redactMongoUri(uri)}...`);
                const connectPromise = mongoose_1.default.connect(uri, {
                    serverSelectionTimeoutMS: 10000,
                    connectTimeoutMS: 10000,
                });
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`MongoDB connect timeout after ${MONGODB_CONNECT_TIMEOUT_MS}ms`)), MONGODB_CONNECT_TIMEOUT_MS);
                });
                await Promise.race([connectPromise, timeoutPromise]);
                lastError = undefined;
                break;
            }
            catch (error) {
                lastError = error;
                console.error("MongoDB connection attempt failed:", error);
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes("MongoDB connect timeout")) {
                    throw error;
                }
            }
        }
        if (lastError) {
            throw lastError;
        }
        console.log('✅ MongoDB Connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map