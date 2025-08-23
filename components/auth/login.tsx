'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@/lib/auth-hooks';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff, Chrome, FlaskConical } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthActions();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to main page if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Clear error when component mounts or when error changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await signIn(email, password);
        setIsSuccess(true);
        // The redirect will happen automatically via useEffect when user state changes
      } catch (error) {
        // Error is handled by the auth hook
      }
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A2A44] p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#AB47BC] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FF6200] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#00C853] rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-[#D3D3D3]/20 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6200] to-[#AB47BC] rounded-full flex items-center justify-center shadow-lg">
              <FlaskConical className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white font-sans">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#D3D3D3] text-sm">
            Enter your credentials to access ChemVR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#D3D3D3]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-white/5 border-[#D3D3D3]/30 text-white placeholder-[#D3D3D3]/60 focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all duration-300 ${
                    formErrors.email ? 'border-red-400' : ''
                  }`}
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#D3D3D3]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white/5 border-[#D3D3D3]/30 text-white placeholder-[#D3D3D3]/60 focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all duration-300 ${
                    formErrors.password ? 'border-red-400' : ''
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#D3D3D3] hover:text-white transition-colors duration-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-400">{formErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-[#00C853] hover:text-[#00C853]/80 text-sm font-medium underline transition-colors duration-300"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#FF6200] hover:bg-[#FF6200]/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-[#D3D3D3]/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A2A44] px-4 text-[#D3D3D3] rounded-[10px]">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-[#D3D3D3]/50 text-white bg-white/10 hover:bg-white/20 hover:border-[#D3D3D3]/70 transition-all duration-300"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          {/* Success Message */}
          {isSuccess && (
            <Alert className="border-[#00C853]/30 bg-[#00C853]/10 text-[#00C853]">
              <AlertDescription>
                Login successful! Redirecting to molecular builder...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-400/30 bg-red-400/10 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation to Sign Up */}
          <div className="text-center text-sm">
            <span className="text-[#D3D3D3]">Don't have an account? </span>
            <button
              onClick={() => router.push('/signup')}
              className="text-[#00C853] hover:text-[#00C853]/80 font-medium underline transition-colors duration-300"
              disabled={loading}
            >
              Sign up here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}