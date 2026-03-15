"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Calendar, Edit3, Trash2, PenSquare, Video as VideoIcon } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

interface Blog {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Video {
  _id: string;
  title: string;
  selectedTopic: string;
  filePath: string;
  createdAt: string;
  author: {
    _id: string;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const response = await api.get("/blog");
        // Filter blogs by user id (backend should ideally have a /my-blogs route, but we'll filter here for simplicity given the current schema)
        const userId = user?.id || (user as any)?._id;
        const myBlogs = response.data.filter((b: any) => b.author._id === userId);
        setBlogs(myBlogs);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoadingBlogs(false);
      }
    };
    const fetchMyVideos = async () => {
      try {
        const response = await api.get("http://localhost:4000/api/videos");
        const userId = user?.id || (user as any)?._id;
        const myVideos = response.data.filter((v: any) => v.author?._id === userId);
        setVideos(myVideos);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setLoadingVideos(false);
      }
    };
    
    if (user) {
      fetchMyBlogs();
      fetchMyVideos();
    }
  }, [user]);

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blog/${id}`);
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (error) {
      console.error("Delete blog failed", error);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.delete(`http://localhost:4000/api/videos/${id}`);
      setVideos(videos.filter(v => v._id !== id));
    } catch (error) {
      console.error("Delete video failed", error);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 rounded-2xl border border-white/10 glass p-8 shadow-2xl h-fit sticky top-24"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
            <p className="text-white/60">{user.email}</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Mail size={18} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <PenSquare size={18} />
              <span>{blogs.length} Stories published</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <VideoIcon size={18} />
              <span>{videos.length} Videos uploaded</span>
            </div>
          </div>
        </motion.aside>

        <div className="space-y-16">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">My Stories</h1>
            <Link
              href="/create-blog"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-gray-200 transition-all shadow-lg"
            >
              <PenSquare size={18} />
              <span>New Story</span>
            </Link>
            </div>

            {loadingBlogs ? (
               <div className="space-y-4">
                 {[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}
               </div>
            ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-12 text-center text-white/40">
              <PenSquare size={48} className="mb-4 opacity-20" />
              <p>You haven't written any stories yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="group flex flex-col gap-4 rounded-2xl border border-white/10 glass p-6 transition-all hover:border-white/20 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                      {blog.title}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-sm text-white/60">
                      {blog.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                      <Calendar size={12} />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="rounded-lg bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.main>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">My Videos</h1>
              <Link
                href="/videos"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg"
              >
                <VideoIcon size={18} />
                <span>Upload Video</span>
              </Link>
            </div>

            {loadingVideos ? (
               <div className="space-y-4">
                 {[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />)}
               </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-12 text-center text-white/40">
                <VideoIcon size={48} className="mb-4 opacity-20" />
                <p>You haven't uploaded any videos yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 glass p-6 transition-all hover:border-white/20 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                        {video.title}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-indigo-400">
                        {video.selectedTopic}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                        <Calendar size={12} />
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="rounded-lg bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
