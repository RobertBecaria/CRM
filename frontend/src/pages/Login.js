import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Heart, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.detail || 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[hsl(var(--background))]">
      {/* Left side - Image */}
      <div className="hidden lg:block relative login-gradient">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-12 h-12 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4 font-['Space_Grotesk']">
              KinesioCRM
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-md">
              Your personal client management system for holistic wellness practice
            </p>
          </div>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1655435600406-6968a32a3a34?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200" 
          alt="Calming water texture" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      </div>

      {/* Right side - Login form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md card-shadow">
          <CardHeader className="text-center">
            <div className="lg:hidden w-16 h-16 mx-auto mb-4 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {isRegister ? 'Create Account' : 'Welcome back'}
            </CardTitle>
            <CardDescription>
              {isRegister 
                ? 'Set up your admin account to get started' 
                : 'Sign in to manage your clients'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              {error && (
                <Alert variant="destructive" data-testid="login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  data-testid="login-password-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-press" 
                disabled={loading}
                data-testid="login-form-submit-button"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                ) : (
                  isRegister ? 'Create Account' : 'Sign in'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {isRegister ? (
                  <p>
                    Already have an account?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsRegister(false); setError(''); }}
                      className="text-[hsl(var(--primary))] hover:underline"
                      data-testid="switch-to-login"
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p>
                    First time?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsRegister(true); setError(''); }}
                      className="text-[hsl(var(--primary))] hover:underline"
                      data-testid="switch-to-register"
                    >
                      Create admin account
                    </button>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
