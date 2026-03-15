"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface VideoUploadFormProps {
  onUploadSuccess?: () => void;
}

const TOPICS = [
  'Technology',
  'Education',
  'Entertainment',
  'Gaming',
  'Music',
  'Sports',
  'Other',
];

export default function VideoUploadForm({ onUploadSuccess }: VideoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !selectedTopic) {
      setError('Please fill in all fields and select a file.');
      return;
    }

    // Client-side validation for file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB.');
      return;
    }
    
    // Client-side validation for file type
    if (file.type !== 'video/mp4' && file.type !== 'video/quicktime') {
      setError('Only MP4 and MOV files are allowed.');
      return;
    }

    setError('');
    setMessage('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('selectedTopic', selectedTopic);

    try {
      const response = await axios.post('http://localhost:4000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      setMessage('Video uploaded successfully!');
      setFile(null);
      setTitle('');
      setSelectedTopic('');
      
      // Reset file input specifically if it has a ref, or just let states reset
      const fileInput = document.getElementById('videoFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 glass p-6 md:p-8 shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white">Upload Video</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            required
            placeholder="Awesome video title..."
          />
        </div>

        <div>
           <label htmlFor="topic" className="block text-sm font-medium text-white/70 mb-1">Topic</label>
          <select
            id="topic"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors [&>option]:bg-gray-900"
            required
          >
            <option value="" disabled>Select a topic</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="videoFile" className="block text-sm font-medium text-white/70 mb-1">Video File (MP4, MOV)</label>
          <input
            type="file"
            id="videoFile"
            accept="video/mp4, video/quicktime"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all"
            required
          />
        </div>

        {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}
        {message && <p className="text-sm text-emerald-400 font-medium">{message}</p>}

        {isUploading && (
          <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            <div className="text-xs text-center mt-2 text-white/60 font-medium">{uploadProgress}%</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
           className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg mt-4"
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}
