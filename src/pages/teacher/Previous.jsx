import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, Users, Loader, FileSpreadsheet } from 'lucide-react';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { getTeacherSessions, getSessionRecords } from '../../services/dbService';
import { downloadCSV } from '../../utils/csv';

const Previous = () => {
  const { user } = useTeacherAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchSessions = async () => {
    try {
      const data = await getTeacherSessions(user.uid);
      setSessions(data);
    } catch (error) {
      console.error("Failed to load previous sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const handleDownload = async (sessionId, subject, createdAt) => {
    setDownloadingId(sessionId);
    try {
      const records = await getSessionRecords(sessionId);
      if (!records || records.length === 0) {
        alert("No student submissions found for this session.");
        setDownloadingId(null);
        return;
      }
      const dateStr = createdAt?.toDate ? createdAt.toDate().toISOString().split('T')[0] : 'SessionDate';
      const filename = `${subject.replace(/\s+/g, '_')}_${dateStr}.csv`;
      downloadCSV(records, filename);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      alert("Error generating CSV file.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}><Loader className="lucide-spin" size={40} /></div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
          Attendance History
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          View past sessions and export attendance data.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 2rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #d1d5db' }}>
          <FileSpreadsheet size={48} color="#9ca3af" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151' }}>No sessions found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((session) => (
            <div key={session.sessionId} style={{ 
              backgroundColor: '#ffffff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>{session.subject}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Calendar size={16} />
                      {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={16} />
                      {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: session.status === 'OPEN' ? '#dcfce3' : '#f3f4f6', 
                  color: session.status === 'OPEN' ? '#166534' : '#4b5563', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem', 
                  fontWeight: '600' 
                }}>
                  {session.status}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
                  <Users size={18} /> {session.submittedCount || 0} Students Present
                </div>
                
                <button
                  onClick={() => handleDownload(session.sessionId, session.subject, session.createdAt)}
                  disabled={downloadingId === session.sessionId}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#111827',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: downloadingId === session.sessionId ? 'not-allowed' : 'pointer'
                  }}
                >
                  {downloadingId === session.sessionId ? <Loader className="lucide-spin" size={16} /> : <Download size={16} />}
                  Export CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Previous;