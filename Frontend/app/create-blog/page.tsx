"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { PenTool, Image as ImageIcon, Loader2, Save, Upload, Link as LinkIcon, X } from "lucide-react";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("upload");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setCoverImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = coverImage;

    try {
      // Handle local file upload first if needed
      if (uploadMethod === "upload" && imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await api.post("/blog/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImageUrl = uploadRes.data.url;
      }

      await api.post("/blog/create", { 
        title, 
        description, 
        content, 
        coverImage: finalImageUrl 
      });
      router.push("/");
    } catch (error: any) {
      console.error("Failed to create blog", error);
      const failingUrl = error.config ? `${error.config.baseURL}${error.config.url}` : "unknown URL";
      const message = error.response?.data?.error || error.response?.data?.message || error.message || "Please try again.";
      alert(`[v2-DEBUG] Failed at ${failingUrl}: ${message}`);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 rounded-2xl border border-white/10 glass p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/10 p-2 text-white">
            <PenTool size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Write a Story</h1>
            <p className="text-white/60">Share your thoughts with the world</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Title</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-bold text-white placeholder-white/20 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="Give your story a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Description</label>
              <textarea
                required
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="What is this story about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Cover Image</label>
                <div className="flex gap-2 rounded-lg bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("upload")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      uploadMethod === "upload" ? "bg-white text-black" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Upload size={14} /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("url")}
                    className={`flex items-center gap-2 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      uploadMethod === "url" ? "bg-white text-black" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <LinkIcon size={14} /> URL
                  </button>
                </div>
              </div>

              {uploadMethod === "upload" ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-6 hover:border-white/20 hover:bg-white/[0.07] transition-all"
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {previewUrl ? (
                    <div className="relative h-full w-full overflow-hidden rounded-lg">
                      <img src={previewUrl} className="h-40 w-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 text-white/40" size={32} />
                      <p className="text-sm text-white/60">Click to upload an image</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-white/40" />
                  <input
                    type="url"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/20 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="https://images.unsplash.com/..."
                    value={coverImage}
                    onChange={(e) => {
                      setCoverImage(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                  />
                  {previewUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                      <img src={previewUrl} className="h-40 w-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Content</label>
              <textarea
                required
                rows={12}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-serif text-lg"
                placeholder="Start writing..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black shadow-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
            >
              {(loading || isUploading) ? <Loader2 className="animate-spin" /> : (
                <>
                  <Save size={18} />
                  <span>Publish Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
