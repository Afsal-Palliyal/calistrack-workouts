import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Activity } from 'lucide-react';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Failed to ' + (isLogin ? 'log in' : 'sign up') + '. Please check credentials.');
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="bg-primary/20 p-4 rounded-full mb-6 relative">
        <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full"></div>
        <Activity size={48} className="text-primary relative z-10" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
        Calistrack
      </h1>
      <p className="text-textMuted mb-8 text-center">Track your bodyweight journey</p>

      <Card className="w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-textMuted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primaryHover font-medium transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </Card>
    </div>
  );
}
