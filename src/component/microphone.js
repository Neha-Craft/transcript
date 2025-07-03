import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, ChevronDown, Check, Square } from 'lucide-react';

export default function MicrophoneRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMicrophone, setSelectedMicrophone] = useState('Internal Microphone (Built-in)');
  const [audioLevel, setAudioLevel] = useState(0);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Get available microphones
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAvailableMicrophones(audioInputs);
      })
      .catch(err => console.error('Error getting devices:', err));
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      console.log('Microphone permission granted');
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setHasPermission(false);
      
      // Show specific error messages
      if (err.name === 'NotAllowedError') {
        alert('Microphone access denied. Please click the microphone icon in your browser\'s address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (err.name === 'NotReadableError') {
        alert('Microphone is being used by another application. Please close other apps and try again.');
      } else {
        alert('Error accessing microphone: ' + err.message);
      }
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support microphone access. Please use Chrome, Firefox, or Safari.');
        return;
      }

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert('Microphone permission is required. Please allow microphone access and try again.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      // Set up audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Monitor audio levels
      const monitorAudioLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);
        animationRef.current = requestAnimationFrame(monitorAudioLevel);
      };
      monitorAudioLevel();

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Recording saved:', audioUrl);
        // You can process the audio blob here
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      
      // Show specific error messages
      if (err.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone.');
      } else if (err.name === 'NotReadableError') {
        alert('Microphone is busy. Please close other applications using the microphone.');
      } else if (err.name === 'OverconstrainedError') {
        alert('Microphone settings not supported. Trying with basic settings...');
        // Try again with basic settings
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          // Continue with basic setup...
        } catch (basicErr) {
          alert('Could not access microphone with basic settings: ' + basicErr.message);
        }
      } else {
        alert('Error accessing microphone: ' + err.message);
      }
      
      // Reset state on error
      setIsRecording(false);
      setRecordingTime(0);
      setAudioLevel(0);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsRecording(false);
    setAudioLevel(0);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle microphone selection
  const handleMicrophoneSelect = (device) => {
    setSelectedMicrophone(device.label || `Microphone ${device.deviceId.substr(0, 5)}`);
    setIsDropdownOpen(false);
  };

  // Generate audio level bars
  const generateAudioBars = () => {
    const bars = [];
    const barCount = 4;
    const maxHeight = audioLevel / 255 * 100;
    
    for (let i = 0; i < barCount; i++) {
      const height = Math.max(10, maxHeight - (i * 10));
      bars.push(
        <div
          key={i}
          className="w-1 bg-green-500 rounded-sm transition-all duration-75"
          style={{ height: `${height}%` }}
        />
      );
    }
    return bars;
  };

  return (
    <div>
    
      <div className="flex items-center gap-4 mb-12">
        <div className={`w-4 h-4 border-2 ${
          isRecording ? 'border-red-500' : 'border-gray-300'
        } rounded-full flex items-center justify-center`}>
          <div className={`w-3 h-3 ${
            isRecording ? 'bg-red-500' : 'bg-gray-400'
          } rounded-full ${isRecording ? 'animate-pulse' : ''}`}></div>
        </div>
        
        <span className="text-[15px] font-light text-gray-700">
          {formatTime(recordingTime)}
        </span>
        
        <Mic className={`w-4 h-4 ${isRecording ? 'text-green-500' : 'text-gray-400'}`} />
        
        {/* Microphone Selection */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div className="flex items-center gap-1 h-6">
              {isRecording ? generateAudioBars() : (
                <>
                  <div className="w-1 h-4 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-6 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-sm"></div>
                  <div className="w-1 h-5 bg-gray-400 rounded-sm"></div>
                </>
              )}
            </div>
            <span className="text-sm">
              {selectedMicrophone.length > 20 
                ? selectedMicrophone.substring(0, 20) + '...' 
                : selectedMicrophone}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

       
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 z-10">
              <button
                onClick={() => handleMicrophoneSelect({ label: 'Internal Microphone (Built-in)', deviceId: 'default' })}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
              >
                <span>Internal Microphone (Built-in)</span>
                {selectedMicrophone === 'Internal Microphone (Built-in)' && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </button>
          
          
          
          
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {/* <div className="text-center max-w-md">
        <h2 className="text-2xl font-normal text-gray-800 mb-4">
          {isRecording ? 'Recording in progress...' : 'Start this session using the header'}
        </h2>
        <p className="text-gray-500 text-base">
          {isRecording 
            ? 'Your audio is being recorded. Click stop when finished.' 
            : 'Your note will appear here once your session is complete'}
        </p>
      </div> */}

      {/* Recording Status */}
      {isRecording && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording active</span>
          </div>
        </div>
      )}
    </div>
  );
}