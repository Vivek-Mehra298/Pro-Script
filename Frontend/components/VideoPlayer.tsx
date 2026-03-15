"use client";

import React from 'react';
import { User, Calendar } from 'lucide-react';

interface VideoPlayerProps {
  videoPath: string; // The backend path like /uploads/filename.mp4
  title?: string;
  topic?: string;
  authorName?: string;
  createdAt?: string;
}

export default function VideoPlayer({ videoPath, title, topic, authorName, createdAt }: VideoPlayerProps) {
  // Assuming backend is running on http://localhost:4000
  const backendUrl = "http://localhost:4000";
  const fullVideoUrl = `${backendUrl}${videoPath}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 glass transition-all hover:border-indigo-500/50">
      <div className="aspect-video w-full bg-black flex items-center justify-center">
        <video 
          controls 
          className="w-full h-full"
          src={fullVideoUrl}
          controlsList="nodownload"
        >
          Your browser does not support HTML video.
        </video>
      </div>
      {(title || topic || authorName) && (
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-white/50">
            {authorName && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{authorName}</span>
              </div>
            )}
            {authorName && createdAt && <span>•</span>}
            {createdAt && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {title && <h3 className="mb-2 text-xl font-bold leading-tight text-white group-hover:text-indigo-400 transition-colors">{title}</h3>}
          {topic && (
            <div className="mt-auto pt-3">
               <span className="inline-block px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded-full border border-indigo-500/30">
                 {topic}
               </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
