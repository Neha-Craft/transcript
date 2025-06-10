"use client";
import React, { useState } from "react";
import { Mic, Plus } from "lucide-react";
import Notestabs from "@/component/notestabs";

// Mock Notestabs component

export default function Encounter() {
  const [activeTab, setActiveTab] = useState("Transcript");
  const [encounterType, setEncounterType] = useState("in-person");
  const [showFolder, setShowFolder] = useState(false);

  const handleShowFolder = () => {
    setShowFolder(true);
  };

  const tabs = ["Transcript", "Note"];

  return (
    <div>
      <div className="flex-1 bg-white min-h-screen">
        <div className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl  font-aeonik text-gray-900 font-bold">Encounter</h1>
        </div>

        <div className="px-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer font-aeonik ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        {activeTab === "Transcript" && (
          <div>
            <div className="flex flex-col items-center justify-center px-8 py-16">
              <div className="mb-12">
                <div
                  className="w-20 h-20 bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-lg"
                  onClick={handleShowFolder}
                >
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
              {!showFolder && (
                <div className="w-full max-w-md mb-8">
                  <div className=" mb-4">
                    <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                      CONTEXT
                    </span>
                  </div>
                  <button
                    className="w-full font-aeonik border border-gray-200 rounded-lg py-2 text-gray-500 hover:border-gray-300 hover:text-gray-600 hover:bg-[rgb(220,224,233)] transition-all duration-200 flex items-center justify-center"
                    onClick={() => setShowFolder(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add context
                  </button>
                </div>
              )}

              {showFolder && (
                <div className="w-full max-w-md mb-8">
                  <div className="flex justify-between text-center items-center">
                    <div
                      className="text-center "
                      onChange={() => setShowFolder(!showFolder)}
                    >
                      <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                        CONTEXT
                      </span>
                    </div>
                    <div className="">
                      <Mic className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Name, gender, age, medical history..."
                      className="w-full border border-gray-200 rounded-lg py-4 px-4 pr-10 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="w-full max-w-md mb-12">
                <div className="mb-6">
                  <span className="text-sm font-medium font-aeonik text-gray-600 uppercase tracking-wide">
                    SETTINGS
                  </span>
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <label  className="text-sm font-aeonik font-medium text-gray-700">
                    Encounter type
                  </label>
                  <select
                    value={encounterType}
                    onChange={(e) => setEncounterType(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
                  >
                    <option value="in-person">In-person</option>
                    <option value="virtual">Virtual</option>
                    <option value="phone">Phone</option>
                  </select>
                </div>

                <div className="">
                  <label className="block text-sm font-aeonik  font-medium text-gray-700 mb-2">
                    Test your microphone
                  </label>
                </div>
              </div>
              <button className=" bg-primary hover:bg-primary text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center w-[431px] justify-center">
                <Mic className="w-4 h-4 mr-2" />
                <p className="font-aeonik">Start encounter</p>
              </button>
            </div>

            <div className="fixed bottom-4 right-4 text-gray-400 text-sm">
              <div className="font-aeonik">Activate Windows</div>
              <div className="text-xs font-aeonik">Go to Settings to activate Windows.</div>
            </div>
          </div>
        )}
        {activeTab === "Note" && <Notestabs />}
      </div>
    </div>
  );
}
