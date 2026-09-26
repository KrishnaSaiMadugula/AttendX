import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import our context provider and routing engine
import { TeacherAuthProvider } from './context/TeacherAuthContext';
import App from './App';

// Import global styles
import './assets/styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeacherAuthProvider>
        <App />
      </TeacherAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);