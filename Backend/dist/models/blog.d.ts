import { Schema, Document } from "mongoose";
export interface IBlog extends Document {
    title: string;
    content: string;
    description: string;
    author: Schema.Types.ObjectId;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Blog: import("mongoose").Model<IBlog, {}, {}, {}, Document<unknown, {}, IBlog, {}, import("mongoose").DefaultSchemaOptions> & IBlog & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBlog>;
export default Blog;
//# sourceMappingURL=blog.d.ts.map