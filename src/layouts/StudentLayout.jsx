import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Public layout for students.
 * Absolutely no authentication checks exist here.
 * Designed purely as a mobile-first canvas container.
 */
const StudentLayout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* The child page (like /scan) will be injected here into the Outlet */}
      <Outlet />
    </div>
  );
};

export default StudentLayout;