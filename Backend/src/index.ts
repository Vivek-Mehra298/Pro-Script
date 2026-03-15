import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import userRouter from "./routes/user";
import blogRouter from "./routes/blog";
import videoRouter from "./routes/video";

const app=express();

app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pro-script";
const MONGO_URI_FALLBACK = process.env.MONGODB_URI_FALLBACK;

function redactMongoUri(uri: string) {
    try {
        const url = new URL(uri);
        return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
        return "mongodb://<redacted>";
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/',(req:Request,res:Response)=>{
    res.send("ProScript API is running")
})

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
        const candidateUris = [MONGO_URI, MONGO_URI_FALLBACK].filter(Boolean) as string[];

        let lastError: unknown = undefined;
        for (let i = 0; i < candidateUris.length; i++) {
            const uri = candidateUris[i]!;
            try {
                console.log(`Connecting to MongoDB (attempt ${i + 1}/${candidateUris.length}) at ${redactMongoUri(uri)}...`);
                await mongoose.connect(uri);
                lastError = undefined;
                break;
            } catch (error) {
                lastError = error;
                console.error("MongoDB connection attempt failed:", error);
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
