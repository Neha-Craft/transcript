import React from 'react'
import { ChevronDown, Mic, Settings, HelpCircle, Zap, Mail, Trash2 } from "lucide-react"

export default function DateEncounter({encounters,isToday,formatDate}) {
  return (
    <div>
         <div className="flex-1 overflow-y-auto">
        {encounters.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <div className="px-4 ">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide font-aeonik px-2">
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
    </div>
  )
}
