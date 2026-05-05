/**
 * Updated App.tsx
 *
 * Drop this into: src/app/App.tsx
 *
 * Changes from original:
 *  - handleSignIn now receives user data from the API response (via SignInPage)
 *  - handleSignOut clears the JWT token
 *  - Everything else (pages, layout, theme) is completely unchanged
 */

import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { SignUpPage } from './components/SignUpPage';
import { SignInPage } from './components/SignInPage';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { TechnicianDashboard } from './components/TechnicianDashboard';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { ComplaintsProvider, useComplaints } from './contexts/ComplaintsContext';
import { removeToken } from './services/api';

type Page = 'landing' | 'signup' | 'signin' | 'supervisor' | 'student' | 'technician';
type UserRole = 'supervisor' | 'student' | 'technician' | null;

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { setCurrentUser } = useComplaints();

  const handleSignIn = (role: UserRole, userData?: any) => {
    setUserRole(role);

    if (userData) {
      setCurrentUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        hostel: userData.hostel,
        roomNumber: userData.roomNumber,
      });
    } else {
      // Fallback: read from localStorage (kept for compatibility)
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        setCurrentUser(user);
      }
    }

    if (role === 'supervisor') setCurrentPage('supervisor');
    else if (role === 'student') setCurrentPage('student');
    else if (role === 'technician') setCurrentPage('technician');
  };

  const handleSignOut = () => {
    // Remove JWT token
    removeToken();

    // Clear any legacy localStorage keys
    localStorage.removeItem('userHostel');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeSupervisors');

    setUserRole(null);
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
      {currentPage === 'landing' && (
        <LandingPage
          onSignIn={() => setCurrentPage('signin')}
          onSignUp={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'signup' && (
        <SignUpPage
          onBack={() => setCurrentPage('landing')}
          onSignIn={() => setCurrentPage('signin')}
        />
      )}
      {currentPage === 'signin' && (
        <SignInPage
          onBack={() => setCurrentPage('landing')}
          onSignIn={handleSignIn}
          onSignUp={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'supervisor' && (
        <SupervisorDashboard onSignOut={handleSignOut} />
      )}
      {currentPage === 'student' && (
        <StudentDashboard onSignOut={handleSignOut} />
      )}
      {currentPage === 'technician' && (
        <TechnicianDashboard onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ComplaintsProvider>
        <Toaster position="top-right" />
        <AppContent />
      </ComplaintsProvider>
    </ThemeProvider>
  );
}
