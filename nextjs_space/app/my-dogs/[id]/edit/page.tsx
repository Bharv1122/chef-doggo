'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { DogProfileForm } from '@/components/forms/dog-profile-form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EditDogPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const dogId = params?.id as string;
  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && dogId) {
      fetchDog();
    }
  }, [status, dogId, router]);

  async function fetchDog() {
    try {
      const response = await fetch(`/api/dogs/${dogId}`);
      if (!response.ok) throw new Error('Failed to fetch dog');
      const data = await response.json();
      setDog(data?.dog);
    } catch (error) {
      toast.error('Failed to load dog profile');
      router.push('/my-dogs');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !dog) {
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
          <h1 className="text-3xl font-bold text-[#1C1917] mb-2">Edit Dog Profile</h1>
          <p className="text-[#78716C] mb-8">
            Update your dog's information
          </p>

          <DogProfileForm initialData={dog} isEdit={true} />
        </div>
      </div>
    </div>
  );
}