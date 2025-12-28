'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DogProfileFormEnhanced } from '@/components/forms/dog-profile-form-enhanced';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewDogPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FDF6E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF6E9] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/my-dogs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Dogs
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#1C1917] mb-2">Add New Dog</h1>
          <p className="text-[#78716C] mb-8">
            Create a profile for your dog to generate personalized recipes
          </p>

          <DogProfileFormEnhanced />
        </div>
      </div>
    </div>
  );
}