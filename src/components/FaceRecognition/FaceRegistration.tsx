import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, User, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FaceRegistrationProps {
  onClose: () => void;
  onRegistrationComplete: (userId: string, faceData: string) => void;
  user: { id: string; name: string; username: string };
}

const FaceRegistration: React.FC<FaceRegistrationProps> = ({ 
  onClose, 
  onRegistrationComplete, 
  user 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
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
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
    }
  };

  const processRegistration = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setRegistrationStatus('idle');

    try {
      // Simulate face encoding process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Send image to backend ML service
      // 2. Extract face encodings using face_recognition library
      // 3. Store encodings with user ID in database
      // 4. Return success/failure status
      
      const faceEncodingData = {
        userId: user.id,
        userName: user.name,
        encoding: capturedImage, // In real app, this would be the face encoding array
        timestamp: new Date().toISOString()
      };

      // Store in localStorage for demo (in real app, send to backend)
      const existingRegistrations = JSON.parse(localStorage.getItem('faceRegistrations') || '[]');
      const updatedRegistrations = existingRegistrations.filter((reg: any) => reg.userId !== user.id);
      updatedRegistrations.push(faceEncodingData);
      localStorage.setItem('faceRegistrations', JSON.stringify(updatedRegistrations));

      setRegistrationStatus('success');
      onRegistrationComplete(user.id, capturedImage);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setRegistrationStatus('idle');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Face Registration</h2>
              <p className="text-sm text-gray-600">Register {user.name} for face recognition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Camera/Photo Display */}
            <div className="bg-gray-900 rounded-lg overflow-hidden relative">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
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

                  {/* Face Detection Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-full opacity-50"></div>
                  </div>
                </>
              ) : (
                <img 
                  src={capturedImage} 
                  alt="Captured face" 
                  className="w-full h-64 object-cover"
                />
              )}
            </div>

            {/* Status Messages */}
            {registrationStatus === 'success' && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">Face registered successfully!</span>
              </div>
            )}

            {registrationStatus === 'error' && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">Registration failed. Please try again.</span>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Registration Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Position your face within the circular guide</li>
                <li>• Ensure good lighting and clear visibility</li>
                <li>• Look directly at the camera</li>
                <li>• Remove glasses or hats if possible</li>
                <li>• Keep a neutral expression</li>
              </ul>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              {!capturedImage ? (
                <button
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={retakePhoto}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={processRegistration}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isProcessing ? 'Processing...' : 'Register Face'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;