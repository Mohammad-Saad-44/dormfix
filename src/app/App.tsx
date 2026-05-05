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

type Page = 'landing' | 'signup' | 'signin' | 'supervisor' | 'student' | 'technician';
type UserRole = 'supervisor' | 'student' | 'technician' | null;


function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { setCurrentUser } = useComplaints();

  const handleSignIn = (role: UserRole) => {
    setUserRole(role);

    // Get user data from localStorage (set by SignInPage)
    const currentUserData = localStorage.getItem('currentUser');

    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      setCurrentUser(user);
    }

    if (role === 'supervisor') setCurrentPage('supervisor');
    else if (role === 'student') setCurrentPage('student');
    else if (role === 'technician') setCurrentPage('technician');
  };

  const handleSignOut = () => {
    // Clear supervisor session if logged in as supervisor
    const userHostel = localStorage.getItem('userHostel');
    if (userRole === 'supervisor' && userHostel) {
      const activeSupervisors = JSON.parse(localStorage.getItem('activeSupervisors') || '{}');
      delete activeSupervisors[userHostel];
      localStorage.setItem('activeSupervisors', JSON.stringify(activeSupervisors));
    }

    // Clear user data
    localStorage.removeItem('userHostel');
    localStorage.removeItem('currentUser');
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
