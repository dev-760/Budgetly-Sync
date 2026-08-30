"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Input, Button, Card, BrandLockup } from '@/components/budget-ui';
import { useThemeContext } from '@/lib/theme-provider';
import { storage } from '@/lib/storage';

export default function AuthPage() {
  const router = useRouter();
  const { palette } = useThemeContext();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { username, token }
        : { username };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      if (data.jwt) {
        storage.setItem('budgetly_jwt', data.jwt);
      }

      if (!isLogin && data.token) {
        setToken(data.token);
        setIsLogin(true);
        setError('');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: palette.background }}
    >
      <div className="w-full max-w-md flex flex-col gap-8">
        
        {/* Brand Header */}
        <div className="flex justify-center items-center">
          <BrandLockup />
        </div>

        {/* Main Auth Card */}
        <Card 
          className="w-full p-8 shadow-xl" 
          style={{ 
            boxShadow: `0 20px 40px -10px ${palette.border}`,
            borderColor: palette.border 
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: palette.foreground }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm font-medium" style={{ color: palette.muted }}>
              {isLogin ? 'Sign in to sync your finances across devices' : 'Start tracking your budget securely'}
            </p>
          </div>

          <form id="authForm" onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              placeholder="e.g. hassan123"
              value={username}
              onChange={setUsername}
            />

            {isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  label="Secure Token"
                  placeholder="Paste your login token..."
                  value={token}
                  onChange={setToken}
                  type="password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg text-sm font-medium text-center animate-in fade-in zoom-in-95" style={{ backgroundColor: palette.errorLight, color: palette.error }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              form="authForm"
              size="large"
              className="w-full mt-2 font-semibold shadow-sm"
              disabled={loading || !username.trim()}
            >
              {loading ? 'Processing...' : isLogin ? 'Access Account' : 'Generate Secure Token'}
            </Button>
          </form>

          {/* Registration Info Box */}
          {!isLogin && (
            <div className="mt-8 p-5 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ backgroundColor: palette.primaryLight, borderColor: palette.softPrimary }}>
              <div className="flex items-center gap-2 mb-3">
                <KeyRound size={18} style={{ color: palette.primary }} />
                <h3 className="font-semibold" style={{ color: palette.primary }}>
                  Passwordless Security
                </h3>
              </div>
              <ul className="text-sm space-y-2" style={{ color: palette.foreground }}>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 opacity-70">•</span>
                  <span>Enter any username to create an account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 opacity-70">•</span>
                  <span>We will generate a highly secure Token for you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 opacity-70">•</span>
                  <span>Save that token! You'll use it instead of a password.</span>
                </li>
              </ul>
            </div>
          )}
        </Card>

        {/* Toggle Mode */}
        <div className="text-center pb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm font-medium transition-opacity hover:opacity-70 inline-flex items-center gap-1.5"
            style={{ color: palette.muted }}
          >
            {isLogin ? "New to Budgetly?" : 'Already have a token?'}
            <span style={{ color: palette.primary }}>
              {isLogin ? "Create an account" : 'Sign in here'}
              <ArrowRight size={14} className="inline ml-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}