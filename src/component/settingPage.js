"use client"

import React, { useState } from 'react'
import GeneralTab from './general'
import NoteTab from './note'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General')


  const tabs = ['General', 'Note', 'Dot phrases', 'Personal dictionary', 'Account']

  return (
    <div className="flex-1 bg-white">

      <div className="px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 font-aeonik">Settings</h1>
      </div>

    
      <div className="px-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 font-aeonik border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

     {activeTab === "General" &&(
        <GeneralTab/>

     )
     }
     {activeTab === "Note" && (
        <NoteTab/>
     )}
     
    </div>
  )
}