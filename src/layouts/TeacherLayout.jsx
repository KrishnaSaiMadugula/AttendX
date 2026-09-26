import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTeacherAuth } from '../context/TeacherAuthContext';
import Sidebar from '../components/teacher/Sidebar';

const TeacherLayout = () => {
  const { user } = useTeacherAuth();

  // AUTH GUARD: If no user is detected, kick them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
      
      {/* Our newly created Sidebar goes here */}
      <Sidebar />
      
      {/* The main content area where pages will load */}
      <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
      
    </div>
  );
};

export default TeacherLayout;