import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C2333',
              color: '#F0F2F8',
              border: '1px solid #2A3D58',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#1C2333' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1C2333' },
            },
            duration: 3500,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
