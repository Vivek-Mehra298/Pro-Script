import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";
import videoRouter from "./routes/video";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app=express();
app.set("trust proxy", 1);

app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;
const MONGO_URI_FALLBACK = process.env.MONGODB_URI_FALLBACK || "mongodb://localhost:27017/pro-script";
const MONGODB_CONNECT_TIMEOUT_MS = Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 15000);

function redactMongoUri(uri: string | undefined) {
    if (!uri) return "UNDEFINED";
    if (uri.startsWith("mongodb://localhost") || uri.startsWith("mongodb://127.0.0.1")) {
        return uri;
    }
    try {
        const url = new URL(uri);
        return `${url.protocol}//<redacted_credentials>@${url.host}${url.pathname}`;
    } catch {
        return "<invalid_uri_format>";
    }
}

const FINAL_MONGO_URI = MONGO_URI || MONGO_URI_FALLBACK;

console.log(`[DEBUG] NODE_ENV is: ${process.env.NODE_ENV}`);
console.log(`[DEBUG] MONGODB_URI is ${process.env.MONGODB_URI ? "READY (defined)" : "MISSING"}`);
console.log(`[DEBUG] Final URI to be used: ${redactMongoUri(FINAL_MONGO_URI)}`);
console.log(`[DEBUG] Available Env Keys: ${Object.keys(process.env).sort().join(", ")}`);

if (!MONGO_URI && process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: MONGODB_URI is not defined in the environment.");
    console.error("Please ensure you have set the MONGODB_URI variable in your Railway dashboard.");
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
type OriginRule = { type: "exact"; value: string } | { type: "wildcard_suffix"; suffix: string };

function parseOriginRule(raw: string): OriginRule {
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

function isOriginAllowed(origin: string) {
    return allowedOriginRules.some((rule) => {
        if (rule.type === "exact") return origin === rule.value;
        return origin.endsWith(rule.suffix);
    });
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }
        console.warn(`[CORS] Rejected origin: ${origin}`);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/',(req:Request,res:Response)=>{
    res.send("ProScript API is running")
})

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        mongoReadyState: mongoose.connection.readyState,
    });
});

app.use('/user', userRouter);
app.use('/blog', blogRouter);
app.use('/api/videos', videoRouter);

// 404 Handler
app.use((req, res) => {
    console.log(`[404] Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

async function startServer() {
    try {
        const candidateUris = [FINAL_MONGO_URI].filter(Boolean) as string[];

        let lastError: unknown = undefined;
        for (let i = 0; i < candidateUris.length; i++) {
            const uri = candidateUris[i]!;
            try {
                console.log(`Connecting to MongoDB (attempt ${i + 1}/${candidateUris.length}) at ${redactMongoUri(uri)}...`);

                const connectPromise = mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 10000,
                    connectTimeoutMS: 10000,
                });

                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error(`MongoDB connect timeout after ${MONGODB_CONNECT_TIMEOUT_MS}ms`)), MONGODB_CONNECT_TIMEOUT_MS);
                });

                await Promise.race([connectPromise, timeoutPromise]);
                lastError = undefined;
                break;
            } catch (error) {
                lastError = error;
                const message = error instanceof Error ? error.message : String(error);
                
                if (message.includes("IP address not allowed")) {
                    console.error("❌ MongoDB Atlas: IP address not allowed. Please whitelist 0.0.0.0/0 in your Atlas Network Access settings.");
                } else if (message.includes("Authentication failed")) {
                    console.error("❌ MongoDB Atlas: Authentication failed. Please check your username and password in MONGODB_URI.");
                } else if (message.includes("MongoDB connect timeout")) {
                    console.error(`❌ MongoDB Atlas: Connection timed out. This often happens if the firewall/IP whitelist is blocking the connection.`);
                } else {
                    console.error("❌ MongoDB connection attempt failed:", error);
                }
            }
        }

        if (lastError) {
            throw lastError;
        }
        console.log('✅ MongoDB Connected successfully');

        app.listen(PORT,()=>{
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

startServer();
