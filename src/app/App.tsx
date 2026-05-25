import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmailCenter } from './components/EmailCenter';
import { Payments } from './components/Payments';
import { Users } from './components/Users';
import { Moderators } from './components/Moderators';
import { AddOfflineUsers } from './components/AddOfflineUsers';

function AppInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { t } = useTheme();

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':   return <Dashboard />;
      case 'emails':      return <EmailCenter />;
      case 'payments':    return <Payments />;
      case 'users':       return <Users />;
      case 'moderators':  return <Moderators />;
      case 'add-offline': return <AddOfflineUsers />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div
      className="size-full flex flex-col md:flex-row"
      style={{ background: t.bg, fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' }}
    >
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
