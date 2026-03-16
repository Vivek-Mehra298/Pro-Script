"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/resolve-url";

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

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blog/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Failed to fetch blog", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  if (loading) return (
    <div className="mx-auto max-w-4xl px-6 py-20 animate-pulse">
      <div className="h-10 w-3/4 rounded-lg bg-white/5 mb-6" />
      <div className="h-64 w-full rounded-2xl bg-white/5 mb-10" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-full bg-white/5" />)}
      </div>
    </div>
  );

  if (!blog) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-bold text-white">Blog not found</h1>
      <Link href="/" className="text-white/60 hover:text-white transition-colors">Back to home</Link>
    </div>
  );

  return (
    <article className="mx-auto max-w-4xl px-6 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <header className="mb-12">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl lg:leading-tight">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="font-medium text-white">{blog.author?.fullName || "Unknown Author"}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Calendar size={16} />
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Clock size={16} />
              <span>{Math.ceil(blog.content.split(' ').length / 200)} min read</span>
            </div>
          </div>
        </header>

        {blog.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 aspect-video w-full overflow-hidden rounded-3xl border border-white/10"
          >
            <img
              src={resolveImageUrl(blog.coverImage)}
              className="h-full w-full object-cover"
              alt={blog.title}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-invert max-w-none prose-p:text-white/80 prose-p:leading-relaxed prose-p:text-lg lg:prose-xl"
        >
          <p className="whitespace-pre-wrap">{blog.content}</p>
        </motion.div>
      </motion.div>
    </article>
  );
}
