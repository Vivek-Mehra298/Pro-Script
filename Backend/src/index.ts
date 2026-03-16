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

process.on('SIGTERM', () => {
    console.log('[DEBUG] SIGTERM received - Railway is terminating the process');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[DEBUG] SIGINT received');
    process.exit(0);
});

const app=express();
app.set("trust proxy", 1);

// Priority Health Check
app.get('/',(req:Request,res:Response)=>{
    console.log("[DEBUG] Root / hit - App is alive & responding to health check");
    res.send("ProScript API is running")
})

// Sanitize URLs (collapse double slashes like //uploads to /uploads)
app.use((req, res, next) => {
    if (req.url.includes("//")) {
        const sanitizedUrl = req.url.replace(/\/+/g, "/");
        console.log(`[DEBUG] Sanitizing URL: ${req.url} -> ${sanitizedUrl}`);
        req.url = sanitizedUrl;
    }
    next();
});

app.use((req, res, next) => {
    const origin = req.headers.origin || "no-origin";
    console.log(`[DEBUG] ${req.method} ${req.url} - Origin: ${origin}`);
    next();
});

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log(`[DEBUG] Creating missing uploads directory at ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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

console.log(`[DEBUG] DEPLOYMENT_ID: ${new Date().toISOString()}`); 
console.log(`[DEBUG] NODE_ENV is: ${process.env.NODE_ENV}`);
console.log(`[DEBUG] MONGODB_URI is ${process.env.MONGODB_URI ? "READY (defined)" : "MISSING"}`);
console.log(`[DEBUG] Final URI to be used: ${redactMongoUri(FINAL_MONGO_URI)}`);
console.log(`[DEBUG] CORS_ORIGIN is: ${process.env.CORS_ORIGIN || "DEFAULT (localhost:3000)"}`);
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
    let value = raw.trim();
    if (value.endsWith("/") && value.length > 8) {
        value = value.slice(0, -1);
    }
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
        
        // Strip trailing slash for comparison
        const normalizedOrigin = (origin.endsWith("/") && origin.length > 8) ? origin.slice(0, -1) : origin;
        const allowed = isOriginAllowed(normalizedOrigin);
        
        console.log(`[CORS] Checking origin: "${normalizedOrigin}" against rules. Match found: ${allowed}`);
        if (!allowed) {
            console.warn(`[CORS] Rejected origin: ${normalizedOrigin}. Expected one of: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
            return callback(new Error(`CORS policy blocked access from origin: ${normalizedOrigin}`));
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(`[ERROR] Unhandled exception at ${req.method} ${req.url}:`, err.message);
    
    // Check if it's a CORS error
    if (err.message.includes("CORS policy blocked access")) {
        return res.status(403).json({ 
            error: "CORS_FORBIDDEN",
            message: err.message,
            hint: "Check your CORS_ORIGIN environment variable in Railway"
        });
    }

    res.status(500).json({ 
        error: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message 
    });
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

        app.listen(Number(PORT), "0.0.0.0", () => {
            console.log(`🚀 Server is listening on 0.0.0.0:${PORT}`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

startServer();
