// Face Recognition Service
// This service handles all face recognition operations including registration and detection

export interface FaceRegistration {
  userId: string;
  userName: string;
  encoding: string; // In real implementation, this would be a float array
  timestamp: string;
}

export interface DetectionResult {
  userId: string;
  userName: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class FaceRecognitionService {
  private registrations: FaceRegistration[] = [];
  private isInitialized = false;

  constructor() {
    this.loadRegistrations();
  }

  // Initialize the face recognition system
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would:
      // 1. Load the face recognition model (e.g., face-api.js, TensorFlow.js)
      // 2. Initialize the model weights
      // 3. Set up the detection pipeline
      
      console.log('Initializing face recognition system...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate model loading
      
      this.isInitialized = true;
      console.log('Face recognition system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize face recognition system:', error);
      throw error;
    }
  }

  // Load registered faces from storage
  private loadRegistrations(): void {
    try {
      const stored = localStorage.getItem('faceRegistrations');
      if (stored) {
        this.registrations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading face registrations:', error);
      this.registrations = [];
    }
  }

  // Save registrations to storage
  private saveRegistrations(): void {
    try {
      localStorage.setItem('faceRegistrations', JSON.stringify(this.registrations));
    } catch (error) {
      console.error('Error saving face registrations:', error);
    }
  }

  // Register a new face
  async registerFace(userId: string, userName: string, imageData: string | File): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // In a real implementation, this would:
      // 1. Extract face encodings from the image using face_recognition or face-api.js
      // 2. Validate the face quality and uniqueness
      // 3. Store the encodings in the database
      // 4. Handle both File objects (from user creation) and base64 strings (from camera capture)
      
      console.log(`Registering face for user: ${userName}`);
      
      // Simulate face encoding extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Convert File to base64 if needed
      let processedImageData: string;
      if (imageData instanceof File) {
        processedImageData = await this.fileToBase64(imageData);
      } else {
        processedImageData = imageData;
      }
      
      const registration: FaceRegistration = {
        userId,
        userName,
        encoding: processedImageData, // In real app, this would be the face encoding array
        timestamp: new Date().toISOString()
      };

      // Remove existing registration for this user
      this.registrations = this.registrations.filter(reg => reg.userId !== userId);
      
      // Add new registration
      this.registrations.push(registration);
      this.saveRegistrations();

      console.log(`Face registered successfully for ${userName}`);
      return true;
    } catch (error) {
      console.error('Face registration failed:', error);
      return false;
    }
  }

  // Helper method to convert File to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Detect faces in live video frame
  async detectFaces(videoElement: HTMLVideoElement): Promise<DetectionResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.registrations.length === 0) {
      return [];
    }

    try {
      // In a real implementation, this would:
      // 1. Extract face encodings from the current video frame
      // 2. Compare against all registered face encodings
      // 3. Return matches with confidence scores above threshold (95%)
      // 4. Include bounding box coordinates for detected faces

      // Simulate face detection processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // For demo purposes, randomly detect some registered users
      const detectedUsers: DetectionResult[] = [];
      const availableRegistrations = [...this.registrations];
      
      // Simulate detecting 0-3 faces with high confidence
      const numDetected = Math.floor(Math.random() * Math.min(4, availableRegistrations.length));
      
      for (let i = 0; i < numDetected; i++) {
        const randomIndex = Math.floor(Math.random() * availableRegistrations.length);
        const registration = availableRegistrations.splice(randomIndex, 1)[0];
        
        if (registration) {
          detectedUsers.push({
            userId: registration.userId,
            userName: registration.userName,
            confidence: 0.95 + Math.random() * 0.04, // 95-99% confidence
            boundingBox: {
              x: Math.random() * 200,
              y: Math.random() * 150,
              width: 100 + Math.random() * 50,
              height: 120 + Math.random() * 60
            }
          });
        }
      }

      return detectedUsers;
    } catch (error) {
      console.error('Face detection failed:', error);
      return [];
    }
  }

  // Get all registered users
  getRegisteredUsers(): FaceRegistration[] {
    return [...this.registrations];
  }

  // Check if user is registered
  isUserRegistered(userId: string): boolean {
    return this.registrations.some(reg => reg.userId === userId);
  }

  // Remove user registration
  removeRegistration(userId: string): boolean {
    const initialLength = this.registrations.length;
    this.registrations = this.registrations.filter(reg => reg.userId !== userId);
    
    if (this.registrations.length < initialLength) {
      this.saveRegistrations();
      return true;
    }
    return false;
  }

  // Get registration statistics
  getStats() {
    return {
      totalRegistrations: this.registrations.length,
      isInitialized: this.isInitialized,
      lastRegistration: this.registrations.length > 0 
        ? this.registrations[this.registrations.length - 1].timestamp 
        : null
    };
  }
}

// Export singleton instance
export const faceRecognitionService = new FaceRecognitionService();