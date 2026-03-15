"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    coverImage: {
        type: String,
    }
}, { timestamps: true });
const Blog = (0, mongoose_1.model)('blogs', blogSchema);
exports.default = Blog;
//# sourceMappingURL=blog.js.map