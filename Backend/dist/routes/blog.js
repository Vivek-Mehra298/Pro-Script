"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_1 = __importDefault(require("../models/blog"));
const middleware_1 = require("../services/middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Multer Config
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, "../../uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Protected: Upload image
router.post("/upload", middleware_1.checkAuth, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
});
// Public: Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await blog_1.default.find().populate('author', 'fullName email').sort({ createdAt: -1 });
        res.status(200).json(blogs);
    }
    catch (error) {
        console.error("Fetch blogs error:", error);
        res.status(500).json({ message: "Failed to fetch blogs" });
    }
});
// Public: Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await blog_1.default.findById(req.params.id).populate('author', 'fullName email');
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch blog" });
    }
});
// Protected: Create blog
router.post('/create', middleware_1.checkAuth, async (req, res) => {
    const { title, content, description, coverImage } = req.body;
    const authorId = req.user.id;
    console.log("Creating blog with body:", req.body);
    console.log("Author ID from token:", authorId);
    if (!title || !content || !description) {
        return res.status(400).json({ message: "Title, content and description are required" });
    }
    try {
        console.log("Attempting to create blog with author object...");
        const blog = await blog_1.default.create({
            title,
            content,
            description,
            coverImage,
            author: authorId
        });
        console.log("✅ Blog created successfully");
        res.status(201).json(blog);
    }
    catch (error) {
        console.error("❌ Create blog error FULL:", error);
        res.status(500).json({
            message: "Failed to create blog",
            error: error.message,
            stack: error.stack
        });
    }
});
// Protected: Update blog
router.put('/:id', middleware_1.checkAuth, async (req, res) => {
    const { title, content, description, coverImage } = req.body;
    const authorId = req.user.id;
    try {
        const blog = await blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        if (blog.author.toString() !== authorId) {
            return res.status(403).json({ message: "Unauthorized to edit this blog" });
        }
        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.description = description || blog.description;
        blog.coverImage = coverImage || blog.coverImage;
        await blog.save();
        res.status(200).json(blog);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update blog" });
    }
});
// Protected: Delete blog
router.delete('/:id', middleware_1.checkAuth, async (req, res) => {
    const authorId = req.user.id;
    try {
        const blog = await blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ message: "Blog not found" });
        if (blog.author.toString() !== authorId) {
            return res.status(403).json({ message: "Unauthorized to delete this blog" });
        }
        await blog.deleteOne();
        res.status(200).json({ message: "Blog deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete blog" });
    }
});
exports.default = router;
//# sourceMappingURL=blog.js.map