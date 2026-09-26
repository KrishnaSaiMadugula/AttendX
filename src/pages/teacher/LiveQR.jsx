import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { StopCircle, Users, Loader, ShieldCheck, RefreshCw, Plus, Minus } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';
import { closeSession, updateSessionToken } from '../../services/dbService';
import { generateSecureToken, buildQRData } from '../../services/qrService';

const LiveQR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = location.state?.sessionId; 

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [qrTimeLeft, setQrTimeLeft] = useState(15); 

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSession(data);
        setLoading(false);

        if (data.expiresAt) {
          const expiresMs = data.expiresAt.toMillis();
          const nowMs = Date.now();
          const remaining = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
          setTimeLeft(remaining);

          if (remaining === 0 && data.status === 'OPEN') {
            handleCloseSession();
          }
        }
      } else {
        navigate('/'); 
      }
    });

    return () => unsubscribe();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (session?.status !== 'OPEN') return;

    const rotateQR = async () => {
      try {
        const newToken = generateSecureToken();
        await updateSessionToken(sessionId, newToken);
      } catch (error) {
        console.error("Failed to rotate QR token:", error);
      }
    };

    const tickInterval = setInterval(() => {
      setQrTimeLeft((prev) => {
        if (prev <= 1) {
          rotateQR(); 
          return 600; 
        }
        return prev - 1; 
      });
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [session?.status, sessionId]); 

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [timeLeft]);

  const adjustTime = async (minutes) => {
    if (!session || session.status !== 'OPEN') return;
    try {
      const sessionRef = doc(db, 'attendanceSessions', sessionId);
      const currentExpiresMs = session.expiresAt.toMillis();
      const newExpiresMs = currentExpiresMs + (minutes * 60 * 1000);
      
      await updateDoc(sessionRef, {
        expiresAt: Timestamp.fromMillis(Math.max(Date.now(), newExpiresMs))
      });
    } catch (err) {
      console.error("Failed to adjust time:", err);
    }
  };

  const handleCloseSession = async () => {
    setClosing(true);
    try {
      await closeSession(sessionId);
      navigate('/previous');
    } catch (error) {
      console.error("Failed to close session:", error);
      setClosing(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}><Loader className="lucide-spin" size={40} /></div>;
  }

  const qrUrl = buildQRData(sessionId, session.currentToken);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' }}>
          {session.subject}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '1.125rem' }}>
            <Users size={24} /> <span style={{ fontWeight: '600' }}>{session.submittedCount || 0}</span> Submitted
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', fontSize: '1.125rem', backgroundColor: '#fee2e2', padding: '0.5rem 1rem', borderRadius: '12px' }}>
            <span style={{ fontWeight: '700' }}>{formatTime(timeLeft)}</span> Remaining
            
            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
              <button onClick={() => adjustTime(-1)} title="Decrease 1 min" style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}><Minus size={14}/></button>
              <button onClick={() => adjustTime(1)} title="Increase 1 min" style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}><Plus size={14}/></button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '3rem', 
        borderRadius: '24px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'inline-block',
        border: '4px solid #3b82f6'
      }}>
        {timeLeft > 0 && session.status === 'OPEN' ? (
          <QRCodeSVG 
            value={qrUrl} 
            size={350} 
            level="H" 
            includeMargin={true}
          />
        ) : (
          <div style={{ padding: '4rem 2rem', color: '#dc2626', fontWeight: 'bold', fontSize: '1.5rem' }}>
            Session Completed / Expired
          </div>
        )}
        
        {timeLeft > 0 && session.status === 'OPEN' && (
          <>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginTop: '1.5rem', 
              color: '#2563eb',
              fontWeight: '600',
              fontSize: '1.125rem'
            }}>
              <RefreshCw size={20} className={qrTimeLeft <= 3 ? 'lucide-spin' : ''} /> 
              QR Refreshes in: <span style={{ color: qrTimeLeft <= 3 ? '#dc2626' : '#2563eb' }}>{qrTimeLeft}s</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', color: '#16a34a', fontWeight: '500', fontSize: '0.875rem' }}>
              <ShieldCheck size={18} /> Anti-Proxy Security Active
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <button
          onClick={handleCloseSession}
          disabled={closing}
          style={{
            padding: '1rem 3rem',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            margin: '0 auto',
            cursor: closing ? 'not-allowed' : 'pointer'
          }}
        >
          {closing ? <Loader className="lucide-spin" size={24} /> : <StopCircle size={24} />}
          {closing ? 'Closing Session...' : 'Stop Attendance'}
        </button>
      </div>

    </div>
  );
};

export default LiveQR;