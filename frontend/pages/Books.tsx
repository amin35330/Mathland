
import React from 'react';
import { useAppContext } from '../AppContext';
import { Star, Download, BookOpen } from 'lucide-react';

export const Books: React.FC = () => {
  const { books } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 border-r-4 border-primary-500 pr-4">
        کتابخانه ریاضی
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map(book => (
          <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="h-64 overflow-hidden relative group bg-gray-100 dark:bg-gray-900">
              {book.imageUrl ? (
                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <BookOpen size={48} />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Star size={12} fill="currentColor" />
                {book.rating}
              </div>
              <div className="absolute top-2 left-2 bg-primary-600/90 text-white text-xs px-2 py-1 rounded shadow-sm">
                {book.subject}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{book.title}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{book.author}</p>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg mb-4 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
                  {book.description}
                </p>
              </div>
              
              <div className="mt-auto pt-2">
                <a 
                  href={book.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Download size={18} />
                  دانلود فایل
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
