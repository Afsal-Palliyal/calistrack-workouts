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
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-screen px-4 pb-20 pt-10">
      <div className="bg-[#1A1A1A] border border-white/10 p-5 rounded-full mb-8 relative">
        <Activity size={56} className="text-primary relative z-10" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">
        Calistrack
      </h1>
      <p className="text-textMuted mb-10 text-center font-medium tracking-wide">Track your bodyweight journey</p>

      <Card className="w-full relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-white/90">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium shadow-inner">{error}</div>}
        
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
          <Button type="submit" disabled={loading} className="mt-4 py-4 text-lg tracking-wide">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-textMuted gap-1 flex justify-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-primary after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </Card>
    </div>
  );
}
