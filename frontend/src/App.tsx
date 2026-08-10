import React, { useState } from 'react';
import { DataSentinelDashboard } from './pages/DataSentinelDashboard';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  const handleLoginSuccess = (userProfile: { name: string; email: string; role: string }) => {
    setUser(userProfile);
    setIsAuthenticated(true);
  };

  const handleSkipToDemo = () => {
    setUser({
      name: 'Alex Morgan',
      email: 'alex.morgan@datacorp.io',
      role: 'Lead Analytics Engineer'
    });
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        onSkipToDemo={handleSkipToDemo}
      />
    );
  }

  return (
    <DataSentinelDashboard
      currentUser={user}
      onLogout={() => {
        setIsAuthenticated(false);
        setUser(null);
      }}
    />
  );
};

export default App;
