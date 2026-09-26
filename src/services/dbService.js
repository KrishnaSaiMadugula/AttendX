import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy, runTransaction, serverTimestamp } from 'firebase/firestore';

export const saveTeacherSettings = async (teacherId, settings) => {
  await setDoc(doc(db, 'teachers', teacherId), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};

export const getTeacherSettings = async (teacherId) => {
  const docSnap = await getDoc(doc(db, 'teachers', teacherId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const createAttendanceSession = async (sessionData) => {
  const docRef = await addDoc(collection(db, 'attendanceSessions'), {
    ...sessionData, submittedCount: 0, status: 'OPEN', createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getSessionById = async (sessionId) => {
  const docSnap = await getDoc(doc(db, 'attendanceSessions', sessionId));
  return docSnap.exists() ? { sessionId: docSnap.id, ...docSnap.data() } : null;
};

export const getTeacherSessions = async (teacherId) => {
  const q = query(collection(db, 'attendanceSessions'), where('teacherId', '==', teacherId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ sessionId: doc.id, ...doc.data() }));
};

// 100% Reliable CSV Records Fetcher
export const getSessionRecords = async (sessionId) => {
  try {
    const recordsRef = collection(db, 'attendanceSessions', sessionId, 'records');
    const querySnapshot = await getDocs(recordsRef);
    const records = [];
    querySnapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() }));
    return records;
  } catch (err) {
    console.error("Error fetching records:", err);
    return [];
  }
};

export const closeSession = async (sessionId) => {
  await updateDoc(doc(db, 'attendanceSessions', sessionId), { status: 'CLOSED' });
};

export const updateSessionToken = async (sessionId, newToken) => {
  await updateDoc(doc(db, 'attendanceSessions', sessionId), { currentToken: newToken, tokenUpdatedAt: serverTimestamp() });
};

export const submitAttendanceRecordTransaction = async (sessionId, rollNumber, recordData) => {
  const sessionRef = doc(db, 'attendanceSessions', sessionId);
  const cleanRollNumber = rollNumber.toUpperCase().trim();
  const recordRef = doc(db, 'attendanceSessions', sessionId, 'records', cleanRollNumber);

  await runTransaction(db, async (transaction) => {
    const sessionDoc = await transaction.get(sessionRef);
    if (!sessionDoc.exists() || sessionDoc.data().status !== 'OPEN') throw new Error("Session closed or invalid.");
    if ((await transaction.get(recordRef)).exists()) throw new Error("ALREADY_SUBMITTED");

    transaction.set(recordRef, { rollNumber: cleanRollNumber, ...recordData, createdAt: serverTimestamp() });
    transaction.update(sessionRef, { submittedCount: (sessionDoc.data().submittedCount || 0) + 1 });
  });
};