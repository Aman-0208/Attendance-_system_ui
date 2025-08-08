import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Users, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { faceRecognitionService, DetectionResult } from '../../services/faceRecognitionService';

interface CameraAttendanceProps {
  onClose: () => void;
  onAttendanceMarked: (detectedStudents: string[]) => void;
  students: Array<{ id: string; name: string; username: string }>;
}

const CameraAttendance: React.FC<CameraAttendanceProps> = ({ 
  onClose, 
  onAttendanceMarked, 
  students 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectionResult[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    loadRegistrationStats();
    return () => {
      stopCamera();
      stopRealTimeDetection();
    };
  }, []);

  const loadRegistrationStats = () => {
    const stats = faceRecognitionService.getStats();
    setRegisteredCount(stats.totalRegistrations);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const startRealTimeDetection = async () => {
    if (!videoRef.current || isRealTimeMode) return;
    
    setIsRealTimeMode(true);
    
    const detectLoop = async () => {
      if (!videoRef.current || !isRealTimeMode) return;
      
      try {
        const results = await faceRecognitionService.detectFaces(videoRef.current);
        setDetectedFaces(results);
        
        // Auto-mark attendance for detected faces with high confidence
        const highConfidenceDetections = results.filter(r => r.confidence > 0.95);
        if (highConfidenceDetections.length > 0) {
          const detectedUserIds = highConfidenceDetections.map(r => r.userId);
          onAttendanceMarked(detectedUserIds);
        }
      } catch (error) {
        console.error('Real-time detection error:', error);
      }
    };
    
    // Run detection every 2 seconds
    detectionIntervalRef.current = setInterval(detectLoop, 2000);
    detectLoop(); // Run immediately
  };

  const stopRealTimeDetection = () => {
    setIsRealTimeMode(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setDetectedFaces([]);
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setDetectedFaces([]);

    // Capture frame from video
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
    }

    try {
      // Use the face recognition service for detection
      const detected = await faceRecognitionService.detectFaces(videoRef.current);
      setDetectedFaces(detected);
      
      // Mark attendance for detected students
      const detectedUserIds = detected.map(d => d.userId);
      onAttendanceMarked(detectedUserIds);
    } catch (error) {
      console.error('Face detection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Camera Attendance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 lg:h-80 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Processing Overlay */}
                {(isProcessing || isRealTimeMode) && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Processing faces...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 relative">
                            <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-sm">Real-time detection active</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Camera Status */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    cameraActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      cameraActive ? 'bg-white animate-pulse' : 'bg-white'
                    }`} />
                    <span>{cameraActive ? 'Live' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Face Detection Overlays */}
              {detectedFaces.map((face, index) => (
                face.boundingBox && (
                  <div
                    key={`${face.userId}-${index}`}
                    className="absolute border-2 border-green-400 bg-green-400 bg-opacity-20"
                    style={{
                      left: `${(face.boundingBox.x / 640) * 100}%`,
                      top: `${(face.boundingBox.y / 480) * 100}%`,
                      width: `${(face.boundingBox.width / 640) * 100}%`,
                      height: `${(face.boundingBox.height / 480) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      {face.userName} ({Math.round(face.confidence * 100)}%)
                    </div>
                  </div>
                )
              ))}

              {/* Controls */}
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={isRealTimeMode ? stopRealTimeDetection : startRealTimeDetection}
                  disabled={!cameraActive}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                    isRealTimeMode 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isRealTimeMode ? 'Stop Real-time' : 'Start Real-time'}</span>
                </button>
                <button
                  onClick={captureAndProcess}
                  disabled={!cameraActive || isProcessing || isRealTimeMode}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Take Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Detection Results */}
            <div className="space-y-4">
              {/* Registration Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">System Status</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered Faces:</span>
                    <span className="font-medium">{registeredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Detection Mode:</span>
                    <span className={`font-medium ${isRealTimeMode ? 'text-green-600' : 'text-gray-500'}`}>
                      {isRealTimeMode ? 'Real-time Active' : 'Manual'}
                    </span>
                  </div>
                </div>
                {registeredCount === 0 && (
                  <div className="mt-2 flex items-center space-x-1 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">No faces registered yet</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Detection Results</h3>
                </div>
                
                {detectedFaces.length > 0 ? (
                  <div className="space-y-2">
                    {detectedFaces.map((face, index) => (
                      <div key={`${face.userId}-${index}`} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium flex-1 ml-2">
                          {face.userName}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          {Math.round(face.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isProcessing ? 'Analyzing faces...' : 
                     isRealTimeMode ? 'Scanning for faces...' : 'No faces detected yet'}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure registered students are clearly visible</li>
                  <li>• Good lighting is essential</li>
                  <li>• Students should face the camera</li>
                  <li>• Use real-time mode for continuous detection</li>
                  <li>• Register faces in User Management first</li>
                </ul>
              </div>

              {/* Student List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Expected Students</h4>
                <div className="max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {students.filter(s => faceRecognitionService.isUserRegistered(s.id)).map((student) => (
                      <div key={student.id} className="text-sm text-gray-600 py-1">
                        {student.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAttendance;