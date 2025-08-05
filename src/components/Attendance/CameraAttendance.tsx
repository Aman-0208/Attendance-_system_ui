import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Users, CheckCircle, Loader2 } from 'lucide-react';

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
  const [detectedFaces, setDetectedFaces] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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

  const simulateFaceDetection = (): Promise<string[]> => {
    return new Promise((resolve) => {
      // Simulate ML processing time
      setTimeout(() => {
        // Randomly detect some students for demo purposes
        const availableStudents = students.map(s => s.id);
        const numDetected = Math.floor(Math.random() * Math.min(3, availableStudents.length)) + 1;
        const detected = availableStudents
          .sort(() => 0.5 - Math.random())
          .slice(0, numDetected);
        resolve(detected);
      }, 3000);
    });
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
      // Simulate ML face detection process
      const detected = await simulateFaceDetection();
      setDetectedFaces(detected);
      
      // Mark attendance for detected students
      onAttendanceMarked(detected);
    } catch (error) {
      console.error('Face detection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown';
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
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Processing faces...</p>
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

              {/* Controls */}
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={captureAndProcess}
                  disabled={!cameraActive || isProcessing}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Take Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Detection Results */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Detection Results</h3>
                </div>
                
                {detectedFaces.length > 0 ? (
                  <div className="space-y-2">
                    {detectedFaces.map((studentId) => (
                      <div key={studentId} className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          {getStudentName(studentId)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isProcessing ? 'Analyzing faces...' : 'No faces detected yet'}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ensure students are clearly visible</li>
                  <li>• Good lighting is essential</li>
                  <li>• Students should face the camera</li>
                  <li>• Click "Take Attendance" to process</li>
                </ul>
              </div>

              {/* Student List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Expected Students</h4>
                <div className="max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {students.map((student) => (
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