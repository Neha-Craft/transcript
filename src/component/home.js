"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Mic, Settings, HelpCircle, Zap, Mail, Trash2 } from "lucide-react"

export default function Home() {
  const [encounters, setEncounters] = useState([
    { date: "6/7/2025", items: [{ id: 1, status: "Not started", duration: 0 }] },
    {
      date: "6/6/2025",
      items: [
        { id: 2, status: "Not started", duration: 0 },
        { id: 3, status: "Not started", duration: 0 },
        { id: 4, status: "Not started", duration: 0 },
        { id: 5, status: "Not started", duration: 0 },
      ],
    },
  ])
  const [showStartDictate, setShowStartDictate] = useState(false)
  const handleNewEncounter = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    const todayIndex = encounters.findIndex((group) => group.date === today)
    if (todayIndex !== -1) {
      const updatedEncounters = [...encounters]
      const newId = Math.max(...updatedEncounters[todayIndex].items.map((item) => item.id), 0) + 1
      updatedEncounters[todayIndex].items.push({ id: newId, status: "Not started", duration: 0 })
      setEncounters(updatedEncounters)
    } else {
   
      setEncounters([{ date: today, items: [{ id: 1, status: "Not started", duration: 0 }] }, ...encounters])
    }
  }
  const toggleDropdown = (e) => {
    e.stopPropagation()
    setShowStartDictate(!showStartDictate)
  }
  const handleStartDictate = () => {
    console.log("Start dictated note clicked")
    setShowStartDictate(false)
 
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
  }
  const isToday = (dateString) => {
    const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    return dateString === today
  }
  return (
    <div className="w-full max-w-xs h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
   
         <h1 className="text-2xl font-aeonik text-gray-900 font-bold">
            Transcript
          </h1>
      </div>
      <div className="p-4">
        <div className="relative">
          <div className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300">
       
            <button className="flex items-center gap-2 flex-1" onClick={handleNewEncounter}>
              <span className="text-lg">+</span>
              <span className="font-aeonik">New encounter</span>
            </button>

    
            <button className="p-1 hover:bg-gray-200 rounded" onClick={toggleDropdown}>
              <ChevronDown className={`w-4 h-4 transition-transform ${showStartDictate ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showStartDictate && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleStartDictate}
              >
                <Mic className="w-4 h-4" />
                <span className="font-aeonik">Start dictated note</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {encounters.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <div className="px-4 pb-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide font-aeonik">
                {isToday(group.date) ? "TODAY" : formatDate(group.date)}
              </h3>
            </div>

            {group.items.map((item) => (
              <div key={item.id} className="px-4 mb-1">
                <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md group">
                  <div>
                    <div className="text-sm text-gray-900 font-aeonik cursor-pointer">Encounter</div>
                    <div className="text-xs text-gray-500">
                      {item.status} • {item.duration} min
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-200">
        <div className="p-2">
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-aeonik cursor-pointer"
          >
            <Settings className="w-4 h-4 font-aeonik" />
            Settings
          </Link>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Zap className="w-4 h-4" />
            What's new!
          </button>
          <button className="w-full flex items-center font-aeonik gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
            <Mail className="w-4 h-4" />
            Contact us
          </button>
        </div>
      </div>
    </div>
  )
}
