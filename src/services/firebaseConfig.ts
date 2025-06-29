import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have the required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

// Check if using placeholder/demo configuration
const isPlaceholderConfig = 
  firebaseConfig.apiKey === 'your_api_key_here' ||
  firebaseConfig.projectId === 'your_project_id' ||
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.length < 10;

if (missingVars.length > 0 || isPlaceholderConfig) {
  console.warn('⚠️ Firebase not properly configured');
  console.warn('📝 Please update .env with your real Firebase configuration');
  console.warn('🔗 Get your config from: https://console.firebase.google.com/');
  console.warn('📋 Steps to configure:');
  console.warn('   1. Create a Firebase project');
  console.warn('   2. Enable Authentication → Google sign-in method');
  console.warn('   3. Add your domain to authorized domains');
  console.warn('   4. Copy config from Project Settings → General → Web app');
  console.warn('   5. Update .env file with real values');
  console.warn('   6. Restart development server');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  
  if (!isPlaceholderConfig) {
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('🔧 Firebase initialized with placeholder config (authentication disabled)');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Firebase configuration is invalid. Please check your .env file.');
}

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
  hd: undefined // Remove domain restrictions
});

// Add required scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Development mode emulator connection (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('ℹ️ Firebase emulators not available or already connected');
  }
}

// Export configuration status for other services
export const isFirebaseConfigured = () => !isPlaceholderConfig && missingVars.length === 0;

export default app;