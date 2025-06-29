import React, { useState } from 'react';
import { X, LogIn, User, Shield, Zap, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    // Check if Firebase is configured
    const configStatus = authService.getConfigStatus();
    if (!configStatus.configured) {
      if (configStatus.isDemoMode) {
        setError('Demo mode active. Please configure Firebase with your real credentials to enable authentication.');
      } else {
        setError('Firebase is not properly configured. Please check your .env file.');
      }
      setShowSetupInstructions(true);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.signInWithGoogle();
      if (result) {
        onSuccess?.();
        onClose();
      }
      // If result is null, it means redirect was used and we'll handle it elsewhere
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupFirebase = () => {
    window.open('https://console.firebase.google.com/', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sign In to PitchSense</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSetupInstructions ? (
            <>
              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Unlock Premium Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Save Pitch History</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access all your previous pitches and track improvement</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Detailed Analytics</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get comprehensive insights and progress tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Personal Dashboard</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your pitches and view performance trends</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      {error.includes('not properly configured') && (
                        <button
                          onClick={() => setShowSetupInstructions(true)}
                          className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
                        >
                          Show setup instructions
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </button>

              {/* Privacy Note */}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy. 
                Your data is encrypted and secure.
              </p>
            </>
          ) : (
            /* Setup Instructions */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Firebase Setup Required</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  To enable authentication, you need to configure Firebase. Follow these steps:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Create a Firebase Project</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Go to Firebase Console and create a new project</p>
                    <button
                      onClick={handleSetupFirebase}
                      className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Open Firebase Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enable Authentication</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Enable Google sign-in in Authentication → Sign-in method</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Add Your Domain</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add your domain to authorized domains in Authentication settings</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Copy Configuration</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Copy your Firebase config and update the .env file</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Update your .env file:</p>
                <code className="text-xs text-gray-600 dark:text-gray-400 block whitespace-pre-wrap">
{`VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
                </code>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSetupInstructions(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSetupFirebase}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Open Firebase</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;