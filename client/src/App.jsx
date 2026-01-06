import { useState, useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  if (selectedProject) {
    return (
      <KanbanBoard 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  return <Dashboard onSelectProject={setSelectedProject} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;