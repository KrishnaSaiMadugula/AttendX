import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Initialize the Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Force the account selection prompt. 
// This is useful if a teacher has multiple Google accounts (personal vs. university)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Triggers the Google Sign-In popup.
 * @returns {Promise<Object>} The authenticated user object
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
};

/**
 * Logs out the currently authenticated user.
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};