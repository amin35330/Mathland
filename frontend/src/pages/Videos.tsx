
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { Play, X } from 'lucide-react';
import { Video } from '../types';

export const Videos: React.FC = () => {
  const { videos } = useAppContext();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-r-4 border-rose-500 pr-4">
        ویدیو کلوپ ریاضی
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div 
            key={video.id} 
            onClick={() => setSelectedVideo(video)}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer block"
          >
            <div className="relative aspect-video bg-gray-900">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="text-white ml-1" fill="currentColor" size={20} />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                  پایه {video.category}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-rose-500 transition-colors">{video.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">مدرس: {video.tutor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="aspect-video w-full">
              {selectedVideo.videoUrl ? (
                 <div 
                   className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                   dangerouslySetInnerHTML={{ __html: selectedVideo.videoUrl }}
                 />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  لینک ویدیو موجود نیست
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedVideo.title}</h3>
               <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                 <span>مدرس: {selectedVideo.tutor}</span>
                 <span>•</span>
                 <span>پایه {selectedVideo.category}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
