'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Welcome back!');
        router.push('/my-dogs');
        router.refresh();
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6E9] p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src="/chef-doggo-logo.webp"
              alt="Chef Doggo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#F97316]" />
            <h1 className="text-2xl font-bold text-[#1C1917]">Welcome Back</h1>
          </div>
          <p className="text-sm text-[#78716C] mt-2">Sign in to your Chef Doggo account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#78716C]">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-[#F97316] hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}