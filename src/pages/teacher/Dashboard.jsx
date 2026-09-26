import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings as SettingsIcon, Loader, AlertCircle } from 'lucide-react';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { getTeacherSettings, createAttendanceSession } from '../../services/dbService';

const Dashboard = () => {
  const { user } = useTeacherAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const data = await getTeacherSettings(user.uid);
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, [user]);

  const handleStartSession = async () => {
    setLoading(true);
    setError('');

    try {
      const subject = settings?.subject || "General Class";
      // INCREASED DEFAULT RADIUS TO 500m TO FIX LAPTOP VS PHONE GPS TESTING
      const radius = settings?.radius || 500; 
      const sessionMinutes = settings?.duration || 10;
      const challengeQuestion = settings?.question || "What was discussed in class today?";
      const correctAnswer = settings?.correctAnswer || "a";
      const options = settings?.options || { a: "Option A", b: "Option B", c: "Option C", d: "Option D" };

      let latitude = settings?.latitude || 16.5062;
      let longitude = settings?.longitude || 80.6480;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 4000,
              maximumAge: 0
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch (geoErr) {
          console.warn("Using default/saved coordinates due to timeout.");
        }
      }

      const expiresAtMs = Date.now() + (sessionMinutes * 60 * 1000);
      const expiresAt = new Date(expiresAtMs);

      const sessionData = {
        teacherId: user.uid,
        teacherEmail: user.email,
        subject,
        geoConfig: { latitude, longitude, radius: Number(radius) },
        challengeConfig: { question: challengeQuestion, correctAnswer, options },
        currentToken: Math.random().toString(36).substring(2, 10),
        expiresAt
      };

      const sessionId = await createAttendanceSession(sessionData);
      navigate('/live', { state: { sessionId } });
    } catch (err) {
      setError("Failed to start session: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' }}>
          Welcome back, {user?.displayName || 'Teacher'}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '1.125rem' }}>
          Ready to take attendance? Start a new secure session below.
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} /><span>{error}</span>
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Play size={36} color="#2563eb" style={{ marginLeft: '4px' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
          Start Live Attendance
        </h2>
        <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
          This will generate a dynamic, rotating QR code. Students must be within range to submit attendance.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={handleStartSession} disabled={loading} style={{ padding: '1rem 2.5rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
            {loading ? <Loader className="lucide-spin" size={24} /> : <Play size={24} />}
            {loading ? 'Initiating Session...' : 'Start Session Now'}
          </button>
          <button onClick={() => navigate('/settings')} disabled={loading} style={{ padding: '1rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '12px', fontWeight: '600', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}>
            <SettingsIcon size={20} /> Edit Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;