import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FilterSpecification from './components/FilterSpecification';
import ResultsDisplay from './components/ResultsDisplay';
import ExportPanel from './components/ExportPanel';
import SaveDesignModal from './components/SaveDesignModal';
import { LogOut, User } from 'lucide-react';
import axios from 'axios';
import './App.css';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, specification, results, export
  const [filterResults, setFilterResults] = useState(null);
  const [filterParams, setFilterParams] = useState(null);
  const [designLoading, setDesignLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleDesignComplete = (results, params) => {
    setFilterResults(results);
    setFilterParams(params);
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setFilterResults(null);
    setFilterParams(null);
    setError(null);
  };

  const handleCreateNew = () => {
    setCurrentView('specification');
    setFilterResults(null);
    setFilterParams(null);
    setError(null);
  };

  const handleLoadDesign = async (designId) => {
    try {
      setDesignLoading(true);
      const response = await axios.get(`/api/designs/${designId}`);
      const design = response.data.design;
      
      // Load the design specifications and results
      setFilterParams(design.specifications);
      setFilterResults({
        coefficients: design.coefficients,
        ...design.responses
      });
      setCurrentView('results');
    } catch (error) {
      console.error('Failed to load design:', error);
      setError('Failed to load design');
    } finally {
      setDesignLoading(false);
    }
  };

  const handleSaveDesign = () => {
    setShowSaveModal(true);
  };

  const handleSaveComplete = () => {
    setShowSaveModal(false);
    alert('Design saved successfully!');
  };

  return (
    <div className="app">
      <header className="app-header-auth">
        <div className="header-left">
          <h1 onClick={handleBackToDashboard} style={{ cursor: 'pointer' }}>
            🎛️ Filter-Design
          </h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            ) : (
              <User size={15} />
            )}
            <span>{user.name || user.email}</span>
          </div>
          <button className="btn-secondary" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="app-content-auth">
        {currentView === 'dashboard' && (
          <Dashboard 
            onCreateNew={handleCreateNew}
            onLoadDesign={handleLoadDesign}
          />
        )}

        {currentView === 'specification' && (
          <div className="content-wrapper">
            <FilterSpecification 
              onDesignComplete={handleDesignComplete}
              setLoading={setDesignLoading}
              setError={setError}
              onBack={handleBackToDashboard}
            />
          </div>
        )}

        {currentView === 'results' && filterResults && (
          <div className="content-wrapper">
            <ResultsDisplay 
              results={filterResults}
              onBack={handleBackToDashboard}
              onExport={() => setCurrentView('export')}
              onSave={handleSaveDesign}
            />
          </div>
        )}

        {currentView === 'export' && filterResults && (
          <div className="content-wrapper">
            <ExportPanel 
              coefficients={filterResults.coefficients}
              onBack={() => setCurrentView('results')}
            />
          </div>
        )}

        {designLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </main>

      {showSaveModal && filterResults && filterParams && (
        <SaveDesignModal
          parameters={filterParams}
          results={filterResults}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveComplete}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;