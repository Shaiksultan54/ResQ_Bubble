import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, LogIn, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'loginId'>('email');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loginWithId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginMethod === 'email' && (!email || !password)) {
      setLoginError('Please enter both email and password');
      return;
    }
    
    if (loginMethod === 'loginId' && (!loginId || !password)) {
      setLoginError('Please enter both login ID and password');
      return;
    }
    
    try {
      setIsLoading(true);
      if (loginMethod === 'email') {
        await login(email, password);
      } else {
        await loginWithId(loginId, password);
      }
      navigate(from, { replace: true });
    } catch (error) {
      setLoginError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              register your agency
            </Link>
          </p>
        </div>
        
        {loginError && (
          <Alert
            type="error"
            message={loginError}
            icon={<AlertTriangle size={16} />}
            className="animate-fade-in"
          />
        )}
        
        <div className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-gray-900/5">
          <div className="mb-8">
            <div className="flex rounded-lg shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Email Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('loginId')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  loginMethod === 'loginId'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Login ID
              </button>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <Input
                id="loginId"
                name="loginId"
                type="text"
                autoComplete="username"
                required
                placeholder="Login ID (e.g., FIR001)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                icon={<User size={16} />}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
              />
            )}
            
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full group"
                isLoading={isLoading}
                icon={<LogIn size={16} />}
              >
                Sign in
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {loginMethod === 'email' 
                ? 'Use your email address to sign in'
                : 'Use your agency-provided login ID (e.g., FIR001 for Fire Department user 1)'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;