import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Activity, Mail, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative w-full">
      
      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3">
        <div className="bg-[#1A1A1A] border border-white/10 p-2 rounded-xl">
          <Activity size={24} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight">
          Calistrack
        </h1>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        
        <div className="w-full max-w-sm mx-auto">
          <Card className="w-full relative !bg-[#141414] !border-white/10 !p-8">
            <div className="mb-6 text-center">
               <h2 className="text-3xl font-bold mb-2 text-white/90 tracking-tight">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-textMuted text-sm font-medium">
                Track your bodyweight journey
              </p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium shadow-inner">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-textMuted" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !bg-[#0a0a0a] pl-11 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-textMuted" />
                </div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !bg-[#0a0a0a] pl-11 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-6 py-4 text-lg tracking-wide w-full">
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-textMuted flex justify-center items-center gap-1.5">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-white hover:text-primary transition-colors font-semibold"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
