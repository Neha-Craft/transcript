import React from 'react'
import Link from "next/link"

export default function Pdfsummary() {
  return (
    <div className="w-full max-w-xs h-screen bg-white border-r border-gray-200 flex flex-col" style={{maxWidth:"60% !important"}}>
      {/* <div className="p-4 border-b border-gray-200"> */}
   
         <h1 className="text-2xl font-aeonik text-gray-900 font-bold">
            Transcript
          </h1>
         <Link
            href="pdfencounter/pdfprview"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-aeonik cursor-pointer"
          >
         
            PDF Preview
          </Link> 
      {/* </div> */}
   
    </div>
  )
}
