"use client"
import React,{useState} from 'react'

export default function NoteTab() {
    const [noteTemplate, setNoteTemplate] = useState('SOAP ("Assessment" and "Plan" merged)')
  const [splitByProblem, setSplitByProblem] = useState(true)
  const [sectionStyle, setSectionStyle] = useState('Paragraph')
  const [detailLevel, setDetailLevel] = useState('Normal')
  const [hideByDefault, setHideByDefault] = useState(false)
  const [objectiveSectionStyle, setObjectiveSectionStyle] = useState('Paragraph')
  const [subjectiveExpanded, setSubjectiveExpanded] = useState(false)
  const [objectiveExpanded, setObjectiveExpanded] = useState(true)
  const [assessmentExpanded, setAssessmentExpanded] = useState(true)

  return (
    <div>
         <div className="flex">
        {/* Main Content */}
        <div className="flex-1 px-8 py-6">
          {/* General template settings */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">General template settings</h2>
            
            {/* Note template */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note template</label>
              <div className="relative">
                <select
                  value={noteTemplate}
                  onChange={(e) => setNoteTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                >
                  <option>SOAP ("Assessment" and "Plan" merged)</option>
                  <option>SOAP (Traditional)</option>
                  <option>Custom Template</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* General custom instructions */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">General custom instructions</label>
                <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Sections settings */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Sections settings</h2>
            
            {/* SUBJECTIVE Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">SUBJECTIVE</h3>
              
              {/* Custom title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom title</label>
                <input
                  type="text"
                  placeholder="Subjective"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Split by problem */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Split by problem</label>
                  <button
                    onClick={() => setSplitByProblem(!splitByProblem)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      splitByProblem ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        splitByProblem ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section style */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Section style</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSectionStyle('Auto')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      sectionStyle === 'Auto'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setSectionStyle('Bullet points')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      sectionStyle === 'Bullet points'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bullet points
                  </button>
                  <button
                    onClick={() => setSectionStyle('Paragraph')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      sectionStyle === 'Paragraph'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Paragraph
                  </button>
                </div>
              </div>

              {/* Detail level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Detail level</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailLevel('Normal')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      detailLevel === 'Normal'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setDetailLevel('High')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      detailLevel === 'High'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>

              {/* Custom instructions */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Custom instructions</label>
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
              </div>

              {/* Hide section by default */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 font-aeonik">Hide section by default</label>
                  <button
                    onClick={() => setHideByDefault(!hideByDefault)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      hideByDefault ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hideByDefault ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* OBJECTIVE Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium font-aeonik text-gray-700 mb-4 uppercase tracking-wide">OBJECTIVE</h3>
              
              {/* Custom title */}
              <div className="mb-4">
                <label className="block text-sm font-medium font-aeonik text-gray-700 mb-2">Custom title</label>
                <input
                  type="text"
                  placeholder="Objective"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Section style */}
              <div className="mb-4">
                <label className="block text-sm font-medium font-aeonik text-gray-700 mb-2">Section style</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setObjectiveSectionStyle('Auto')}
                    className={`px-3 py-1 text-sm rounded-md border font-aeonik ${
                      objectiveSectionStyle === 'Auto'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setObjectiveSectionStyle('Bullet points')}
                    className={`px-3 py-1 text-sm rounded-md border font-aeonik ${
                      objectiveSectionStyle === 'Bullet points'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bullet points
                  </button>
                  <button
                    onClick={() => setObjectiveSectionStyle('Paragraph')}
                    className={`px-3 py-1 text-sm rounded-md border font-aeonik ${
                      objectiveSectionStyle === 'Paragraph'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Paragraph
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium font-aeonik text-gray-700 uppercase tracking-wide">SUBJECTIVE</h3>
              <button
                onClick={() => setSubjectiveExpanded(!subjectiveExpanded)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <svg 
                  className={`w-4 h-4 text-gray-400 font-aeonik transition-transform ${subjectiveExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium font-aeonik text-gray-700 uppercase tracking-wide">OBJECTIVE</h3>
              <button
                onClick={() => setObjectiveExpanded(!objectiveExpanded)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${objectiveExpanded ? '' : 'rotate-180'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide font-aeonik">ASSESSMENT & PLAN</h3>
              <button
                onClick={() => setAssessmentExpanded(!assessmentExpanded)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform ${assessmentExpanded ? '' : 'rotate-180'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {assessmentExpanded && (
              <div className="ml-4 space-y-1">
                <div className="text-sm font-aeonik text-gray-600">Problem 1</div>
                <div className="text-sm font-aeonik text-gray-600">Problem 2</div>
                <div className="text-sm font-aeonik text-gray-600">Problem 3</div>
              </div>
            )}
          </div>
        </div>
    </div>
    </div>
  )
}
