import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Video } from '../models/video';
import { checkAuth } from '../services/middleware';

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Multer upload config
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Allowed common video formats: mp4 and mov (quicktime)
        const allowedMimeTypes = ['video/mp4', 'video/quicktime'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4 and MOV video files are allowed.'));
        }
    }
});

// Route to handle video upload
router.post('/upload', checkAuth, upload.single('video'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
             res.status(400).json({ error: 'No video file provided.' });
             return;
        }

        const { title, selectedTopic } = req.body;

        if (!title || !selectedTopic) {
             // Cleanup the uploaded file if metadata is missing
             fs.unlinkSync(req.file.path);
             res.status(400).json({ error: 'Title and selectedTopic are required.' });
             return;
        }

        const author = (req as any).user.id || (req as any).user._id;

        // The exact filePath to save. Note that our index.ts serves '/uploads' mapped to the uploads folder.
        const filePath = `/uploads/${req.file.filename}`;

        const video = new Video({
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
    } catch (error: any) {
        console.error('Error uploading video:', error);
        
        // Handle multer errors
        if (error instanceof multer.MulterError) {
             if (error.code === 'LIMIT_FILE_SIZE') {
                  res.status(400).json({ error: 'File size exceeds 100MB limit.' });
                  return;
             }
        }
        res.status(500).json({ error: error.message || 'An error occurred during video upload.' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const videos = await Video.find({})
            .populate('author', 'fullName email')
            .sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (error: any) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});

router.delete('/:id', checkAuth, async (req: Request, res: Response) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        
        // Verify author
        const userId = (req as any).user.id || (req as any).user._id;
        if (video.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this video.' });
        }

        // Delete the file
        const fullFilePath = path.join(__dirname, '../../', video.filePath);
        if (fs.existsSync(fullFilePath)) {
            fs.unlinkSync(fullFilePath);
        }

        await Video.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Video deleted successfully.' });
    } catch (error: any) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video.' });
    }
});

export default router;
