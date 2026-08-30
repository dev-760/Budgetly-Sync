"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, KeyRound } from 'lucide-react';
import { Input, Button, Card } from '@/components/budget-ui';
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

      // Store JWT
      if (data.jwt) {
        storage.setItem('budgetly_jwt', data.jwt);
      }

      // If register, show the token
      if (!isLogin && data.token) {
        setToken(data.token);
        setIsLogin(true);
        setError('');
        return;
      }

      // Redirect to home
      router.push('/');

    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: palette.foreground }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm" style={{ color: palette.muted }}>
            {isLogin ? 'Sign in to manage your finances' : 'Get started with Budgetly'}
          </p>
        </div>

        <form id="authForm" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={setUsername}
          />

          {isLogin && (
            <Input
              label="Token"
              placeholder="Enter your token"
              value={token}
              onChange={setToken}
            />
          )}

          {error && (
            <p className="text-sm text-center" style={{ color: palette.error }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            form="authForm"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm"
            style={{ color: palette.primary }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {!isLogin && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ backgroundColor: palette.primaryLight }}>
            <p className="font-medium mb-1" style={{ color: palette.primary }}>
              How it works:
            </p>
            <ul className="text-left space-y-1" style={{ color: palette.foreground }}>
              <li>• Enter a username (3-20 characters)</li>
              <li>• We'll generate a secure token for you</li>
              <li>• Use the token to sign in on any device</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}