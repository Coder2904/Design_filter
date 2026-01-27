import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Shield, Database, TrendingUp } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);

  const handleCredentialResponse = async (response) => {
    setError(null);
    const result = await loginWithGoogle(response.credential);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 300
        }
      );
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleCredentialResponse]); // Added dependency

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Zap size={48} color="#667eea" />
          </div>
          <h1>Digital Filter Design Tool</h1>
          <p className="tagline">Professional FIR & IIR Filter Designer</p>
        </div>

        <div className="features-grid">
          <div className="feature">
            <Zap size={24} color="#667eea" />
            <h3>Advanced Design</h3>
            <p>FIR & IIR filters with multiple methods</p>
          </div>
          <div className="feature">
            <TrendingUp size={24} color="#667eea" />
            <h3>Real-time Visualization</h3>
            <p>Interactive frequency & time domain plots</p>
          </div>
          <div className="feature">
            <Database size={24} color="#667eea" />
            <h3>Cloud Storage</h3>
            <p>Save and manage your designs</p>
          </div>
          <div className="feature">
            <Shield size={24} color="#667eea" />
            <h3>Secure & Private</h3>
            <p>Your designs are safe with us</p>
          </div>
        </div>

        <div className="login-section">
          <h2>Sign in to get started</h2>
          <p>Access your saved designs and start creating filters</p>
          
          <div id="google-signin-button" className="google-button-container"></div>
          
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
        </div>

        <div className="login-footer">
          <p style={ {color:'black'}}>By signing in, you agree to our Terms of Service and Privacy Policy </p>
        </div>
      </div>
    </div>
  );
};

export default Login;