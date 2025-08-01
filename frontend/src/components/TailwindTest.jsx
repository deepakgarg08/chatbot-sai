import React from 'react';

export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🎨 Tailwind CSS Test
        </h1>
        
        <div className="space-y-4">
          {/* Colors Test */}
          <div className="grid grid-cols-5 gap-2">
            <div className="h-8 bg-red-500 rounded"></div>
            <div className="h-8 bg-blue-500 rounded"></div>
            <div className="h-8 bg-green-500 rounded"></div>
            <div className="h-8 bg-yellow-500 rounded"></div>
            <div className="h-8 bg-purple-500 rounded"></div>
          </div>
          
          {/* Button Test */}
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            🚀 Tailwind Test Button
          </button>
          
          {/* Status */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
            <p className="text-green-800 font-bold">
              ✅ Tailwind CSS is Working!
            </p>
            <p className="text-green-600 text-sm mt-1">
              All classes are rendering correctly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
