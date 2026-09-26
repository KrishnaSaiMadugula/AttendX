import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, History, Settings as SettingsIcon, LogOut, Edit2 } from 'lucide-react';
import { TeacherAuthProvider, useTeacherAuth } from './context/TeacherAuthContext';

import Dashboard from './pages/teacher/Dashboard';
import LiveQR from './pages/teacher/LiveQR';
import Previous from './pages/teacher/Previous';
import Settings from './pages/teacher/Settings';
import Login from './pages/teacher/Login';
import ScanAttendance from './pages/student/ScanAttendance';

const SidebarLayout = ({ children }) => {
  // Pull in the new update function
  const { user, logout, updateTeacherName } = useTeacherAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Live QR', path: '/live', icon: <QrCode size={20} /> },
    { name: 'History', path: '/previous', icon: <History size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  // Function to handle the gear icon click
  const handleEditName = async () => {
    const currentName = user?.displayName || 'Teacher';
    const newName = window.prompt("Enter your new display name:", currentName);
    
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        await updateTeacherName(newName.trim());
      } catch (error) {
        console.error("Failed to update name:", error);
        alert("An error occurred while updating your name.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '2rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>AttendX</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Teacher Portal</p>
        </div>
        
        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                borderRadius: '8px', textDecoration: 'none', fontWeight: '500',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#2563eb' : '#4b5563',
                transition: 'all 0.2s'
              }}>
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          
          {/* USER PROFILE SECTION WITH GEAR ICON */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1e3a8a', flexShrink: 0 }}>
                {user?.displayName?.charAt(0) || 'T'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || 'Teacher'}
              </span>
            </div>
            
            {/* The Edit Gear Icon */}
            <button 
              onClick={handleEditName} 
              title="Edit Name"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <SettingsIcon size={16} />
            </button>
          </div>

          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontWeight: '500', cursor: 'pointer', borderRadius: '8px' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useTeacherAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <SidebarLayout>{children}</SidebarLayout>;
};

function App() {
  return (
    <TeacherAuthProvider>
      <Routes>
        <Route path="/scan" element={<ScanAttendance />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute><LiveQR /></ProtectedRoute>} />
        <Route path="/previous" element={<ProtectedRoute><Previous /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TeacherAuthProvider>
  );
}

export default App;