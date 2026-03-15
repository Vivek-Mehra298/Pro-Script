import { Schema, model, Document } from "mongoose";

export interface IBlog extends Document {
    title: string;
    content: string;
    description: string;
    author: Schema.Types.ObjectId;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    coverImage: {
        type: String,
    }
}, { timestamps: true });

const Blog = model<IBlog>('blogs', blogSchema);

export default Blog;
