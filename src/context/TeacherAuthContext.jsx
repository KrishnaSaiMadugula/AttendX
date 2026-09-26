import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from 'firebase/auth';

const TeacherAuthContext = createContext();

const ALLOWED_TEACHER_EMAILS = [
  "boomboomshakalaka6969@gmail.com",
  "krishnasaimadugula89@gmail.com"
];

export const TeacherAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    const isAllowed = ALLOWED_TEACHER_EMAILS.includes(email) || email.endsWith('@vrsec.ac.in');
    
    if (!isAllowed) {
      await signOut(auth);
      throw new Error("Access Denied: You must use an authorized teacher email.");
    }
  };

  const logout = () => signOut(auth);

  // NEW: Manual name update function
  const updateTeacherName = async (newName) => {
    if (auth.currentUser) {
      // 1. Update securely in Firebase backend
      await updateProfile(auth.currentUser, { displayName: newName });
      // 2. Instantly update the screen without needing a refresh
      setUser({ ...auth.currentUser, displayName: newName });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <TeacherAuthContext.Provider value={{ user, login, logout, updateTeacherName }}>
      {children}
    </TeacherAuthContext.Provider>
  );
};

export const useTeacherAuth = () => useContext(TeacherAuthContext);