"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const video_1 = require("../models/video");
const middleware_1 = require("../services/middleware");
const router = express_1.default.Router();
// Ensure the uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer storage config
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// Multer upload config
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Allowed common video formats: mp4 and mov (quicktime)
        const allowedMimeTypes = ['video/mp4', 'video/quicktime'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only MP4 and MOV video files are allowed.'));
        }
    }
});
// Route to handle video upload
router.post('/upload', middleware_1.checkAuth, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No video file provided.' });
            return;
        }
        const { title, selectedTopic } = req.body;
        if (!title || !selectedTopic) {
            // Cleanup the uploaded file if metadata is missing
            fs_1.default.unlinkSync(req.file.path);
            res.status(400).json({ error: 'Title and selectedTopic are required.' });
            return;
        }
        const author = req.user.id || req.user._id;
        // The exact filePath to save. Note that our index.ts serves '/uploads' mapped to the uploads folder.
        const filePath = `/uploads/${req.file.filename}`;
        const video = new video_1.Video({
            title,
            selectedTopic,
            filePath,
            author
        });
        await video.save();
        res.status(201).json({
            message: 'Video uploaded successfully.',
            video
        });
    }
    catch (error) {
        console.error('Error uploading video:', error);
        // Handle multer errors
        if (error instanceof multer_1.default.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({ error: 'File size exceeds 100MB limit.' });
                return;
            }
        }
        res.status(500).json({ error: error.message || 'An error occurred during video upload.' });
    }
});
router.get('/', async (req, res) => {
    try {
        const videos = await video_1.Video.find({})
            .populate('author', 'fullName email')
            .sort({ createdAt: -1 });
        res.status(200).json(videos);
    }
    catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});
router.delete('/:id', middleware_1.checkAuth, async (req, res) => {
    try {
        const video = await video_1.Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        // Verify author
        const userId = req.user.id || req.user._id;
        if (video.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this video.' });
        }
        // Delete the file
        const fullFilePath = path_1.default.join(__dirname, '../../', video.filePath);
        if (fs_1.default.existsSync(fullFilePath)) {
            fs_1.default.unlinkSync(fullFilePath);
        }
        await video_1.Video.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Video deleted successfully.' });
    }
    catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video.' });
    }
});
exports.default = router;
//# sourceMappingURL=video.js.map