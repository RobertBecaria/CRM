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
      const message = err.response?.data?.detail || 'Произошла ошибка. Попробуйте снова.';
      // Translate common error messages
      const translatedMessage = message
        .replace('Invalid email or password', 'Неверный email или пароль')
        .replace('Admin user already exists. Registration disabled.', 'Администратор уже существует. Регистрация отключена.');
      setError(translatedMessage);
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
              КинезиоCRM
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-md">
              Ваша персональная система управления клиентами для практики психокинезиологии
            </p>
          </div>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1655435600406-6968a32a3a34?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200" 
          alt="Спокойная текстура воды" 
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
              {isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}
            </CardTitle>
            <CardDescription>
              {isRegister 
                ? 'Настройте свой аккаунт администратора' 
                : 'Войдите для управления клиентами'
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
                <Label htmlFor="password">Пароль</Label>
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Подождите</>
                ) : (
                  isRegister ? 'Создать аккаунт' : 'Войти'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {isRegister ? (
                  <p>
                    Уже есть аккаунт?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsRegister(false); setError(''); }}
                      className="text-[hsl(var(--primary))] hover:underline"
                      data-testid="switch-to-login"
                    >
                      Войти
                    </button>
                  </p>
                ) : (
                  <p>
                    Первый раз?{' '}
                    <button 
                      type="button"
                      onClick={() => { setIsRegister(true); setError(''); }}
                      className="text-[hsl(var(--primary))] hover:underline"
                      data-testid="switch-to-register"
                    >
                      Создать аккаунт администратора
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
