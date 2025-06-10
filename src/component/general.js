"use client"
import React,{useState} from 'react'

export default function GeneralTab() {
      const [language, setLanguage] = useState('English (UK)')
  const [mainLanguage, setMainLanguage] = useState('English (US)')
  const [secondaryLanguage, setSecondaryLanguage] = useState('None')
  const [showTemplate, setShowTemplate] = useState(true)
  const [punctuation, setPunctuation] = useState('Explicit')
  return (
    <div>
         <div className="px-8 py-6 max-w-2xl">
     
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-aeonik font-medium text-gray-900 mb-1">Language</h3>
            <p className="text-sm font-aeonik text-gray-600">Interface and note language</p>
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border font-aeonik border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
            >
              <option>English (UK)</option>
              <option>English (US)</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

     
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-medium font-aeonik text-gray-900 mb-1">Main encounter language</h3>
            <p className="text-sm text-gray-600 font-aeonik">The language you most often speak with your patient</p>
          </div>
          <div className="relative">
            <select
              value={mainLanguage}
              onChange={(e) => setMainLanguage(e.target.value)}
              className="w-full font-aeonik px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 font-aeonik mb-1">Secondary encounter language</h3>
            <p className="text-sm text-gray-600 font-aeonik">Any other language you also speak with your patient</p>
          </div>
          <div className="relative">
            <select
              value={secondaryLanguage}
              onChange={(e) => setSecondaryLanguage(e.target.value)}
              className="w-full font-aeonik px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
            >
              <option>None</option>
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

 
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium font-aeonik text-gray-900 mb-1">Show the note template selector before each encounter</h3>
              <p className="text-sm text-gray-600 font-aeonik">Useful if you often switch note templates</p>
            </div>
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showTemplate ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showTemplate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

  
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-medium font-aeonik text-gray-900 mb-1">Punctuation when dictating</h3>
            <p className="text-sm text-gray-600 font-aeonik">You can dictate punctuation explicitly or let Nabla detect it automatically</p>
          </div>
          <div className="relative">
            <select
              value={punctuation}
              onChange={(e) => setPunctuation(e.target.value)}
              className="w-full px-3 py-2 border font-aeonik border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
            >
              <option>Explicit</option>
              <option>Automatic</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
         <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-aeonik font-medium text-gray-900 mb-1">
              Patient naming{' '}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                BETA
              </span>
            </h3>
            <p className="text-sm font-aeonik text-gray-600">Noun that will be used in the note to refer to the person that you're seeing</p>
          </div>
          <input
            type="text"
            placeholder="Patient, client..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
           <div className="mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium font-aeonik text-gray-900">Letter should be addressed to the patient</h3>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
        </div>
           <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-base font-aeonik font-medium text-gray-900 mb-1">Microphone</h3>
              <p className="text-sm text-gray-600 font-aeonik mb-2">Microphone used to listen to your encounters</p>
              <p className="text-sm text-orange-600 font-aeonik font-medium">⚠️ Microphone permission not granted</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-1 font-aeonik">Encounters saving duration</h3>
              <p className="text-sm text-gray-600 font-aeonik">Encounters will be automatically deleted 14 days after they've been created</p>
            </div>
            <span className="text-sm font-medium text-gray-900 font-aeonik">14 days</span>
          </div>
          <button className="flex items-center font-aeonik gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete all encounters
          </button>
        </div>
          <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium font-aeonik text-gray-900 mb-1">Allow audio sharing after an encounter to improve the transcription</h3>
              <p className="text-sm text-gray-600">
                You will need{' '}
                <button className="text-blue-600 font-aeonik hover:text-blue-700 underline">
                  the patient's consent
                </button>
              </p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-200">
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
        </div>
      

    
        {/* <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 mb-1">Patient naming</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              BETA
            </span>
          </div>
        </div> */}
      </div>

    </div>
  )
}
