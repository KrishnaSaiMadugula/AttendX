import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, Settings, History, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';
import { useTeacherAuth } from '../../context/TeacherAuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useTeacherAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Function to dynamically style active vs inactive links
  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: isActive ? '#2563eb' : '#4b5563', // Blue if active, Gray if inactive
    backgroundColor: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s',
    marginBottom: '0.5rem'
  });

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem'
    }}>
      {/* Logo / Header */}
      <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>AttendX</h2>
        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Teacher Portal</p>
      </div>

      {/* Navigation Links */}
      <nav style={{ flexGrow: 1 }}>
        <NavLink to="/" style={navStyle} end>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/attendance" style={navStyle}>
          <QrCode size={20} /> Live QR
        </NavLink>
        <NavLink to="/previous" style={navStyle}>
          <History size={20} /> History
        </NavLink>
        <NavLink to="/settings" style={navStyle}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>

      {/* User Info & Logout Button */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d1d5db' }} />
          )}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.displayName || 'Teacher'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;