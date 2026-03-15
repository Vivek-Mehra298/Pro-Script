import mongoose, { Document } from 'mongoose';
export interface IVideo extends Document {
    title: string;
    selectedTopic: string;
    filePath: string;
    author: mongoose.Types.ObjectId;
}
export declare const Video: mongoose.Model<IVideo, {}, {}, {}, mongoose.Document<unknown, {}, IVideo, {}, mongoose.DefaultSchemaOptions> & IVideo & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVideo>;
//# sourceMappingURL=video.d.ts.map