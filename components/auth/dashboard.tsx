'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAuthActions } from '@/lib/auth-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Mail } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { logout, loading } = useAuthActions();
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to ChemVR Web</h1>
            <p className="text-gray-600 mt-2">Interactive Molecular Builder and Simulator</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your authentication details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Email:</span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">User ID:</span>
              <span className="text-gray-600 text-sm font-mono">{user?.uid}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Email Verified:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user?.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Application Content */}
        <Card>
          <CardHeader>
            <CardTitle>Molecular Builder</CardTitle>
            <CardDescription>
              Your interactive chemistry workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-2xl font-semibold mb-2">Ready to Build Molecules!</h2>
              <p className="text-gray-600 mb-6">
                You're now authenticated and ready to use the molecular builder.
                The main application content will be displayed here.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This is a placeholder for your main application content. 
                  Replace this component with your actual molecular builder interface.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
