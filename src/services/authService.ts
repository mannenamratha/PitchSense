import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  AuthError,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebaseConfig';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Listen for authentication state changes
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user ? this.mapFirebaseUser(user) : null;
        this.isInitialized = true;
        this.notifyAuthStateListeners();
        
        if (user) {
          console.log('✅ User authenticated:', user.email);
        } else {
          console.log('ℹ️ User not authenticated');
        }
      });

      // Handle redirect result for mobile devices
      await this.handleRedirectResult();
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      // Check if Firebase is properly configured
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured. Please check your .env file and restart the server.');
      }

      console.log('🔄 Attempting Google sign-in...');
      
      // Try popup first (works better on desktop)
      try {
        const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
        console.log('✅ Google sign-in successful via popup:', result.user.email);
        return this.mapFirebaseUser(result.user);
      } catch (popupError: any) {
        console.log('⚠️ Popup failed, trying redirect...', popupError.code);
        
        // If popup fails, try redirect (better for mobile)
        if (
          popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, googleProvider);
          return null; // Result will be handled by redirect
        }
        
        throw popupError;
      }
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code) || error.message || 'Sign-in failed. Please try again.');
    }
  }

  /**
   * Handle redirect result for mobile sign-in
   */
  private async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Redirect sign-in successful:', result.user.email);
        return this.mapFirebaseUser(result.user);
      }
    } catch (error: any) {
      console.error('❌ Redirect result error:', error);
      // Don't throw here as this is called during initialization
    }
    return null;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ Sign-out successful');
    } catch (error: any) {
      console.error('❌ Sign-out failed:', error);
      throw new Error('Sign-out failed. Please try again.');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if auth is initialized
   */
  isAuthInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Call immediately with current state if initialized
    if (this.isInitialized) {
      callback(this.currentUser);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Map Firebase user to our AuthUser interface
   */
  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }

  /**
   * Notify all auth state listeners
   */
  private notifyAuthStateListeners() {
    this.authStateListeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('❌ Auth state listener error:', error);
      }
    });
  }

  /**
   * Get user-friendly error message
   */
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in popup is already open. Please complete that first.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/configuration-not-found':
        return 'Authentication configuration error. Please check your Firebase setup.';
      case 'auth/invalid-api-key':
        return 'Invalid Firebase API key. Please check your .env configuration.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for authentication. Please add it to your Firebase project.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled. Please enable it in your Firebase console.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      default:
        return 'Sign-in failed. Please try again or contact support if the problem persists.';
    }
  }

  /**
   * Check if Firebase is properly configured
   */
  isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; missing: string[]; isDemoMode: boolean } {
    const required = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missing = required.filter(key => !import.meta.env[key]);
    const isPlaceholder = 
      import.meta.env.VITE_FIREBASE_API_KEY === 'your_api_key_here' ||
      import.meta.env.VITE_FIREBASE_PROJECT_ID === 'your_project_id';
    
    return {
      configured: missing.length === 0 && !isPlaceholder,
      missing,
      isDemoMode: isPlaceholder
    };
  }
}

export const authService = new AuthService();