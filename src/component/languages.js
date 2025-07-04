"use client"

import { useState } from "react"
import { Calendar, Languages, Grid3X3, ChevronDown, User, Trash2, Search, Bell, Users, Settings } from "lucide-react"

export default function LanguageComponent() {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showInputDropdown, setShowInputDropdown] = useState(false)
  const [showOutputDropdown, setShowOutputDropdown] = useState(false)
  const [inputLanguage, setInputLanguage] = useState("English")
  const [outputLanguage, setOutputLanguage] = useState("English")

  const languages = [
    { name: "Amharic", beta: true },
    { name: "Arabic", beta: true },
    { name: "Armenian", beta: true },
    { name: "Assamese", beta: true },
    { name: "Auto-detect", beta: false },
    { name: "Azerbaijani", beta: true },
    { name: "English", beta: false },
    { name: "Spanish", beta: false },
    { name: "French", beta: false },
    { name: "German", beta: false },
    { name: "Hindi", beta: false },
    { name: "Japanese", beta: false },
  ]

  const handleLanguageSelect = (language, type) => {
    if (type === "input") {
      setInputLanguage(language)
      setShowInputDropdown(false)
    } else {
      setOutputLanguage(language)
      setShowOutputDropdown(false)
    }
  }

  return (
    <div>

      <div className="flex">

      

    
        <div className="flex-1">
      
          <div className="p-2">
            <div className="flex items-center space-x-8">
          
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <Languages className="w-4 h-4" />
                  <span className="font-medium">English</span>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Language settings</h2>

                    <div className="space-y-6">
                
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">Input language</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Used for transcripts, dictations and uploaded recordings.
                        </p>

                        <div className="relative"  onMouseLeave={() => setShowLanguageDropdown(false)}>
                          <button
                            onClick={() => setShowInputDropdown(!showInputDropdown)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <span>English</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>

                          {showInputDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {languages.map((lang) => (
                                <button
                                  key={lang.name}
                                  onClick={() => handleLanguageSelect(lang.name, "input")}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 border border-gray-300 rounded-sm"></div>
                                    <span>{lang.name}</span>
                                  </div>
                                  {lang.beta && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      Beta
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Output Language */}
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">Output language</h3>
                        <p className="text-sm text-gray-600 mb-3">Used for notes and documents.</p>

                        <div className="relative">
                          <button
                            onClick={() => setShowOutputDropdown(!showOutputDropdown)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <span>English</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>

                          {showOutputDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {languages.map((lang) => (
                                <button
                                  key={lang.name}
                                  onClick={() => handleLanguageSelect(lang.name, "output")}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 border border-gray-300 rounded-sm"></div>
                                    <span>{lang.name}</span>
                                  </div>
                                  {lang.beta && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                      Beta
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

       
        </div>
      </div>
    </div>
  )
}
