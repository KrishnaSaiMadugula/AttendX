import React, { useState, useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import { MapPin, ShieldCheck, AlertOctagon, CheckCircle2, Loader, Fingerprint, LogIn } from 'lucide-react';

import { getSessionById, submitAttendanceRecordTransaction } from '../../services/dbService';

import { calculateDistance } from '../../utils/geo';

import { generateDeviceFingerprint } from '../../utils/fingerprint';

import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../services/firebase';



const ALLOWED_STUDENT_TEST_EMAILS = [

  "boomboomshakalaka6969@gmail.com",

  "krishnasaimadugula89@gmail.com"

];



const ScanAttendance = () => {

  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get('session');

  const token = searchParams.get('token');



  const [step, setStep] = useState('validating');

  const [errorMsg, setErrorMsg] = useState('');

  const [sessionData, setSessionData] = useState(null);

  const [studentUser, setStudentUser] = useState(null);

  const [studentLoc, setStudentLoc] = useState(null);

  const [formData, setFormData] = useState({ rollNumber: '', answer: '' });

  const [submitting, setSubmitting] = useState(false);



  // 1. Validate Session & Listen for Auth state persistence (Prevents mobile reload loops)

  useEffect(() => {

    let isMounted = true;



    const initializeScan = async () => {

      try {

        if (!sessionId || !token) throw new Error("Invalid QR Code structure.");

        const session = await getSessionById(sessionId);

        if (!session) throw new Error("Attendance session not found.");

        if (session.status !== 'OPEN') throw new Error("This attendance session has been closed.");

       

        if (session.currentToken !== token) {

          throw new Error("This QR code has expired. Please scan the newest one on the board.");

        }

       

        if (session.expiresAt && session.expiresAt.toMillis() < Date.now()) {

          throw new Error("The time limit for this attendance session has expired.");

        }



        if (isMounted) {

          setSessionData(session);

        }

      } catch (err) {

        if (isMounted) {

          setErrorMsg(err.message);

          setStep('error');

        }

      }

    };



    initializeScan();



    // Listen to Firebase Auth state to handle mobile redirects/reloads seamlessly

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {

      if (!isMounted) return;

     

      if (user) {

        const email = user.email;

        const isAllowed = ALLOWED_STUDENT_TEST_EMAILS.includes(email) || email.endsWith('@vrsec.ac.in');

       

        if (isAllowed) {

          setStudentUser(user);

          // Only auto-advance if we were waiting for auth or validating

          setStep((prev) => (prev === 'validating' || prev === 'student_auth' ? 'location' : prev));

        } else {

          signOut(auth);

          setErrorMsg("Access Denied: Please sign in with your official college mail ('@vrsec.ac.in').");

          setStep('error');

        }

      } else {

        // If not logged in and session is ready, prompt for student auth

        setStep((prev) => (prev === 'validating' ? 'student_auth' : prev));

      }

    });



    return () => {

      isMounted = false;

      unsubscribeAuth();

    };

  }, [sessionId, token]);



  const handleStudentLogin = async () => {

    try {

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const email = result.user.email;



      const isAllowed = ALLOWED_STUDENT_TEST_EMAILS.includes(email) || email.endsWith('@vrsec.ac.in');

      if (!isAllowed) {

        await signOut(auth);

        throw new Error("Access Denied: Please sign in with your official college mail ('@vrsec.ac.in').");

      }



      setStudentUser(result.user);

      setStep('location');

    } catch (err) {

      setErrorMsg(err.message || "College email login failed.");

      setStep('error');

    }

  };



  const requestLocation = () => {

    if (!navigator.geolocation) {

      setErrorMsg("Geolocation is not supported by your browser.");

      setStep('error');

      return;

    }



    setStep('locating_loader');



    navigator.geolocation.getCurrentPosition(

      (position) => {

        const { latitude, longitude } = position.coords;

        const teacherLat = sessionData.geoConfig.latitude;

        const teacherLon = sessionData.geoConfig.longitude;

        const radius = sessionData.geoConfig.radius;



        const distance = calculateDistance(teacherLat, teacherLon, latitude, longitude);



        if (distance > radius) {

          setErrorMsg(`Location Exceeded: You are ${Math.round(distance)}m away. Must be within ${radius}m of the classroom.`);

          setStep('error');

        } else {

          setStudentLoc({ latitude, longitude, distance });

          setStep('form');

        }

      },

      (error) => {

        setErrorMsg("Precise location access is required. Please turn on Precise Location/GPS on your device.");

        setStep('error');

      },

      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }

    );

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    setErrorMsg('');



    try {

      const fingerprint = generateDeviceFingerprint();



      const recordData = {

        location: studentLoc,

        studentEmail: studentUser.email,

        selectedAnswer: formData.answer || 'No Answer',

        deviceFingerprint: fingerprint,

        status: 'VERIFIED'

      };



      await submitAttendanceRecordTransaction(sessionId, formData.rollNumber, recordData);

      setStep('success');

    } catch (err) {

      if (err.message === "ALREADY_SUBMITTED") {

        setErrorMsg("Attendance has already been recorded for this Roll Number or Device.");

      } else {

        setErrorMsg(err.message || "Failed to submit attendance.");

      }

      setStep('error');

    } finally {

      setSubmitting(false);

    }

  };



  const renderCard = (children) => (

    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9fafb' }}>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>

        {children}

      </div>

    </div>

  );



  if (step === 'validating') {

    return renderCard(

      <>

        <Loader className="lucide-spin" size={48} color="#3b82f6" style={{ margin: '0 auto 1rem auto' }} />

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Validating Security Token...</h2>

      </>

    );

  }



  if (step === 'error') {

    return renderCard(

      <>

        <AlertOctagon size={64} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Access Denied</h2>

        <p style={{ color: '#4b5563' }}>{errorMsg}</p>

      </>

    );

  }



  if (step === 'student_auth') {

    return renderCard(

      <>

        <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>

          <LogIn size={48} color="#3b82f6" />

        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>College Sign-In</h2>

        <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '0.875rem' }}>

          Please sign in with your official college email account to mark attendance.

        </p>

        <button

          onClick={handleStudentLogin}

          style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}

        >

          Sign in with Google

        </button>

      </>

    );

  }



  if (step === 'location' || step === 'locating_loader') {

    return renderCard(

      <>

        <div style={{ backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1.5rem' }}>

          <MapPin size={48} color="#3b82f6" />

        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>GPS Geofence Check</h2>

        <p style={{ color: '#4b5563', marginBottom: '0.5rem', fontSize: '0.875rem' }}>

          Signed in as: <strong style={{ color: '#111827' }}>{studentUser?.email}</strong>

        </p>

        <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '0.875rem' }}>

          Ensure your device precise location is enabled.

        </p>

        <button

          onClick={requestLocation}

          disabled={step === 'locating_loader'}

          style={{ width: '100%', padding: '1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}

        >

          {step === 'locating_loader' ? <><Loader className="lucide-spin" size={20} /> Verifying GPS...</> : 'Share Precise Location'}

        </button>

      </>

    );

  }



  if (step === 'success') {

    return renderCard(

      <>

        <CheckCircle2 size={64} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Attendance Marked!</h2>

        <p style={{ color: '#4b5563' }}>Recorded for: <strong>{studentUser?.email}</strong></p>

        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2rem' }}>You may now close this tab.</p>

      </>

    );

  }



  return renderCard(

    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', marginBottom: '1.5rem', justifyContent: 'center', backgroundColor: '#dcfce3', padding: '0.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600' }}>

        <ShieldCheck size={18} /> Verified ({Math.round(studentLoc.distance)}m away)

      </div>



      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>Submitting as: <strong>{studentUser?.email}</strong></p>



      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Student Roll Number</label>

      <input

        required

        type="text"

        placeholder="Enter your Roll Number"

        value={formData.rollNumber}

        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}

        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase' }}

      />



      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Security Challenge</label>

      <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>{sessionData.challengeConfig.question}</p>

     

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>

        {['a', 'b', 'c', 'd'].map(opt => (

          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.answer === opt ? '#eff6ff' : 'white' }}>

            <input

              type="radio"

              name="answer"

              value={opt}

              checked={formData.answer === opt}

              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}

              style={{ width: '1.25rem', height: '1.25rem' }}

            />

            <span style={{ fontSize: '0.875rem', color: '#111827' }}>{sessionData.challengeConfig.options[opt]}</span>

          </label>

        ))}

      </div>



      <button

        type="submit"

        disabled={submitting}

        style={{ width: '100%', padding: '1rem', backgroundColor: '#111827', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: submitting ? 0.7 : 1 }}

      >

        {submitting ? <Loader className="lucide-spin" size={20} /> : <Fingerprint size={20} />}

        {submitting ? 'Verifying...' : 'Submit Attendance'}

      </button>

    </form>

  );

};



export default ScanAttendance;

