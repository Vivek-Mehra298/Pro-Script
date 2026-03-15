"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Calendar, User, ArrowRight, Video as VideoIcon } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

interface Blog {
  _id: string;
  title: string;
  description: string;
  content: string;
  author?: {
    fullName: string;
    email: string;
  } | null;
  coverImage?: string;
  createdAt: string;
}

interface Video {
  _id: string;
  title: string;
  selectedTopic: string;
  filePath: string;
  createdAt: string;
  author?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [activeTab, setActiveTab] = useState<"All" | "Stories" | "Videos">("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get("/blog");
        setBlogs(response.data);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoadingBlogs(false);
      }
    };
    const fetchVideos = async () => {
      try {
        // Fallback to absolute URL if proxy not fully wired
        const response = await api.get("http://localhost:4000/api/videos");
        setVideos(response.data);
      } catch (error) {
        console.error("Failed to fetch videos", error);
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchBlogs();
    fetchVideos();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-24 space-y-24">
      {/* Hero Section */}
      <div className="mb-16 text-center md:mb-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight md:text-7xl"
        >
          Publish your <span className="text-gradient">passion</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg text-white/60 md:text-xl"
        >
          Discover stories, thinking, and expertise from writers on any topic.
        </motion.p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 glass">
          {["All", "Stories", "Videos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                activeTab === tab
                  ? "text-black shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Section */}
      {(activeTab === "All" || activeTab === "Stories") && (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white/90">Featured Stories</h2>
          <div className="h-[1px] flex-1 bg-white/10 ml-6"></div>
        </div>
        {loadingBlogs ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 glass transition-all hover:border-primary/50"
              >
                <div className="aspect-video w-full overflow-hidden bg-white/5">
                  <img
                    src={blog.coverImage || `https://images.unsplash.com/photo-14?q=80&w=2000&auto=format&fit=crop`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={blog.title}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center gap-3 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{blog.author?.fullName || "Unknown Author"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold leading-tight text-white group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="mb-6 line-clamp-3 text-white/60">
                    {blog.description}
                  </p>
                  <Link
                    href={`/blog/${blog._id}`}
                    className="mt-auto flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
      )}

      {/* Videos Section */}
      {(activeTab === "All" || activeTab === "Videos") && (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white/90">Latest Videos</h2>
          <div className="h-[1px] flex-1 bg-white/10 ml-6"></div>
        </div>
        
        {loadingVideos ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-12 text-center text-white/40">
            <VideoIcon size={48} className="mb-4 opacity-20" />
            <p>No videos available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {videos.slice(0, 8).map((video, index) => (
              <motion.div 
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VideoPlayer 
                  videoPath={video.filePath} 
                  title={video.title} 
                  topic={video.selectedTopic} 
                  authorName={video.author?.fullName}
                  createdAt={video.createdAt}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
      )}

    </main>
  );
}
