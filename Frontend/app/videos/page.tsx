"use client";

import React, { useState, useEffect } from 'react';
import VideoUploadForm from '@/components/VideoUploadForm';
import VideoPlayer from '@/components/VideoPlayer';
import api from '@/lib/api';

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

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Video Hub
          </h1>
          <p className="max-w-xl mt-5 mx-auto text-xl text-white/60">
            Upload and watch videos from our community.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] gap-8">
          <div className="md:col-span-1 h-fit sticky top-24">
            <VideoUploadForm onUploadSuccess={fetchVideos} />
          </div>
          
          {/* Video List Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white border-b pb-4 border-white/10">
              Recent Videos
            </h2>
            
            {loading ? (
              <p className="text-white/60">Loading videos...</p>
            ) : videos.length === 0 ? (
              <p className="text-white/60">No videos uploaded yet. Be the first to upload!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <VideoPlayer 
                    key={video._id} 
                    videoPath={video.filePath} 
                    title={video.title} 
                    topic={video.selectedTopic} 
                    authorName={video.author?.fullName}
                    createdAt={video.createdAt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
