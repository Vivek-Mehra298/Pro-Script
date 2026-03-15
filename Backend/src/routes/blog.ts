import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Blog from "../models/blog";
import { checkAuth } from "../services/middleware";
import multer from "multer";
import path from "path";

const router = Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Protected: Upload image
router.post("/upload", checkAuth, upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  const inferredBaseUrl = `${req.protocol}://${req.get("host")}`;
  const baseUrl = publicBaseUrl || inferredBaseUrl;
  const imageUrl = new URL(`/uploads/${req.file.filename}`, baseUrl).toString();
  res.status(200).json({ url: imageUrl });
});

// Public: Get all blogs
router.get('/', async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find().populate('author', 'fullName email').sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error: any) {
        console.error("Fetch blogs error:", error);
        res.status(500).json({ message: "Failed to fetch blogs" });
    }
});

// Public: Get single blog
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'fullName email');
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch blog" });
    }
});

// Protected: Create blog
router.post('/create', checkAuth, async (req: Request, res: Response) => {
    const { title, content, description, coverImage } = req.body;
    const authorId = (req as any).user.id;

    console.log("Creating blog with body:", req.body);
    console.log("Author ID from token:", authorId);

    if (!title || !content || !description) {
        return res.status(400).json({ message: "Title, content and description are required" });
    }

    try {
        console.log("Attempting to create blog with author object...");
        const blog = await Blog.create({
            title,
            content,
            description,
            coverImage,
            author: authorId
        });
        console.log("✅ Blog created successfully");
        res.status(201).json(blog);
    } catch (error: any) {
        console.error("❌ Create blog error FULL:", error);
        res.status(500).json({ 
            message: "Failed to create blog", 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Protected: Update blog
router.put('/:id', checkAuth, async (req: Request, res: Response) => {
    const { title, content, description, coverImage } = req.body;
    const authorId = (req as any).user.id;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author.toString() !== authorId) {
            return res.status(403).json({ message: "Unauthorized to edit this blog" });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.description = description || blog.description;
        blog.coverImage = coverImage || blog.coverImage;

        await blog.save();
        res.status(200).json(blog);
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update blog" });
    }
});

// Protected: Delete blog
router.delete('/:id', checkAuth, async (req: Request, res: Response) => {
    const authorId = (req as any).user.id;
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        if (blog.author.toString() !== authorId) {
            return res.status(403).json({ message: "Unauthorized to delete this blog" });
        }

        await blog.deleteOne();
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to delete blog" });
    }
});

export default router;
