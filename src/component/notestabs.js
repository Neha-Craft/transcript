import React from 'react'
import { Mic, Copy, Download, Share } from 'lucide-react'

export default function Notestabs() {
  return (
    <div>
      <div className="max-w-4xl pl-8 pt-6">
        {/* Note Header */}
        <div className="mb-4">
          <div className="flex items-center  ">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">FREE TEXT</span>
            <div className="flex items-center space-x-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Download className="w-4 h-4" />
              </button>
           
            </div>
          </div>
        </div>
        <div className="relative group">
          <textarea
            placeholder="Enter your text..."
            className="w-full h-10 p-2 border font-aeonik border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400 overflow-hidden"
            style={{ fontSize: '14px', lineHeight: '1.5' }}
          />
        </div>
      </div>
    </div>
  )
}