import React from 'react'

export default function Contexttab() {
  return (
    <div>
          <div className="p-6 pr-20">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="prose prose-gray max-w-none">
          <div className="relative w-full">
            <textarea
              placeholder="Add any additional context about the patient"
              className="w-full min-h-[200px] text-gray-800 leading-relaxed text-base border-none outline-none resize-none placeholder-gray-400 whitespace-pre-wrap pr-10"
              style={{ fontFamily: "inherit" }}
            />
              <button className="flex items-center gap-2 text-sm border border-gray-200 px-3 py-1 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656L7.05 9.05a6 6 0 008.485 8.485"
            />
          </svg> 
          Not linked to a profile
        </button>
            <button
              type="button"
              className="absolute bottom-3 left-3 text-gray-500 hover:text-gray-700"
              title="Attach a file"
            >
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656L7.05 9.05a6 6 0 008.485 8.485"
                />
              </svg> */}
            </button>
          </div>
        </div>
      </div>

   
    </div>

    </div>
  )
}
