import React from 'react';

const Loading = () => {
  return (
    <div className="grid gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-48 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-lg animate-shimmer relative overflow-hidden"></div>
        <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-lg animate-shimmer relative overflow-hidden"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden"></div>
              <div className="flex-1">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden mb-2"></div>
                <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden"></div>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-full animate-shimmer relative overflow-hidden"></div>
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-full animate-shimmer relative overflow-hidden"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden"></div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded animate-shimmer relative overflow-hidden"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;