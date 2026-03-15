import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  selectedTopic: string;
  filePath: string;
  author: mongoose.Types.ObjectId;
}

const VideoSchema: Schema = new Schema({
  title: { type: String, required: true },
  selectedTopic: { type: String, required: true },
  filePath: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'users', required: true }
}, {
  timestamps: true
});

export const Video = mongoose.model<IVideo>('Video', VideoSchema);
