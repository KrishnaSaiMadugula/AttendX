import React, { useState, useEffect } from 'react';
import { Save, MapPin, Loader } from 'lucide-react';
import { useTeacherAuth } from '../../context/TeacherAuthContext';
import { saveTeacherSettings, getTeacherSettings } from '../../services/dbService';

const Settings = () => {
  const { user } = useTeacherAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Default configuration state
  const [config, setConfig] = useState({
    subject: '',
    latitude: '',
    longitude: '',
    allowedRadius: '50', // Default 50 meters
    duration: '5', // Default 5 minutes
    question: '',
    options: { a: '', b: '', c: '', d: '' },
    correctAnswer: 'a'
  });

  // Fetch existing settings on load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getTeacherSettings(user.uid);
        if (data) setConfig(data);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadSettings();
  }, [user]);

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  // Handle nested option changes (A, B, C, D)
  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      options: { ...prev.options, [name]: value }
    }));
  };

  // Auto-fill GPS coordinates using the browser's hardware
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setConfig(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location permissions.");
        console.error(error);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await saveTeacherSettings(user.uid, config);
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error("Failed to save settings", error);
      setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Reusable input styling
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginTop: '0.25rem',
    fontSize: '0.875rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginTop: '1rem'
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}><Loader className="lucide-spin" size={32} /></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
        Attendance Configurations
      </h1>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: message.type === 'success' ? '#dcfce3' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* --- SECTION 1: Basic Info --- */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          General Setup
        </h2>
        
        <label style={labelStyle}>Subject / Class Name</label>
        <input required type="text" name="subject" value={config.subject} onChange={handleChange} style={inputStyle} placeholder="e.g., Data Structures (CS101)" />

        <label style={labelStyle}>Attendance Window Duration (Minutes)</label>
        <input required type="number" min="1" max="60" name="duration" value={config.duration} onChange={handleChange} style={inputStyle} />

        {/* --- SECTION 2: Geofencing --- */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginTop: '2rem', marginBottom: '1rem' }}>
          Geofencing Security (GPS)
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Latitude</label>
            <input required type="number" step="any" name="latitude" value={config.latitude} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Longitude</label>
            <input required type="number" step="any" name="longitude" value={config.longitude} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <button type="button" onClick={handleGetLocation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#2563eb', fontSize: '0.875rem', fontWeight: '500' }}>
          <MapPin size={18} /> Fetch my current location
        </button>

        <label style={labelStyle}>Allowed Radius (Meters)</label>
        <input required type="number" min="10" max="1000" name="allowedRadius" value={config.allowedRadius} onChange={handleChange} style={inputStyle} placeholder="50" />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Students must be within this distance to mark attendance.</p>

        {/* --- SECTION 3: Cognitive Security (MCQ) --- */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginTop: '2rem', marginBottom: '1rem' }}>
          Active Challenge (MCQ)
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>Ask a dynamic question on the projector to prevent students from sending the QR code to friends at home.</p>
        
        <label style={labelStyle}>Question</label>
        <input required type="text" name="question" value={config.question} onChange={handleChange} style={inputStyle} placeholder="e.g., What is the output of 2 + 2 in Javascript?" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div><label style={labelStyle}>Option A</label><input required type="text" name="a" value={config.options.a} onChange={handleOptionChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Option B</label><input required type="text" name="b" value={config.options.b} onChange={handleOptionChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Option C</label><input required type="text" name="c" value={config.options.c} onChange={handleOptionChange} style={inputStyle} /></div>
          <div><label style={labelStyle}>Option D</label><input required type="text" name="d" value={config.options.d} onChange={handleOptionChange} style={inputStyle} /></div>
        </div>

        <label style={labelStyle}>Correct Answer</label>
        <select name="correctAnswer" value={config.correctAnswer} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: '#f9fafb' }}>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
          <option value="c">Option C</option>
          <option value="d">Option D</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '2rem', width: '100%', padding: '0.875rem', backgroundColor: '#111827', color: 'white',
            borderRadius: '8px', fontSize: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: '0.5rem', cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? <Loader className="lucide-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving Configurations...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;