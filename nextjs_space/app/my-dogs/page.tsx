'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dog, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MyDogsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDogs();
    }
  }, [status, router]);

  async function fetchDogs() {
    try {
      const response = await fetch('/api/dogs');
      if (!response.ok) throw new Error('Failed to fetch dogs');
      const data = await response.json();
      setDogs(data?.dogs ?? []);
    } catch (error) {
      toast.error('Failed to load dog profiles');
    } finally {
      setLoading(false);
    }
  }

  async function deleteDog(dogId: string) {
    if (!confirm('Are you sure you want to delete this dog profile?')) return;

    try {
      const response = await fetch(`/api/dogs/${dogId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete dog');
      
      toast.success('Dog profile deleted');
      fetchDogs();
    } catch (error) {
      toast.error('Failed to delete dog profile');
    }
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1C1917]">My Dogs</h1>
            <p className="text-[#78716C] mt-1">Manage your dog profiles and generate personalized recipes</p>
          </div>
          <Link href="/my-dogs/new">
            <Button className="bg-[#F97316] hover:bg-[#ea580c]">
              <Plus className="w-4 h-4 mr-2" />
              Add Dog
            </Button>
          </Link>
        </div>

        {dogs?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Dog className="w-20 h-20 text-[#F97316] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#1C1917] mb-2">No Dogs Yet</h2>
            <p className="text-[#78716C] mb-6 max-w-md mx-auto">
              Create your first dog profile to start generating personalized homemade recipes.
            </p>
            <Link href="/my-dogs/new">
              <Button className="bg-[#F97316] hover:bg-[#ea580c]">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Dog
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog, i) => (
              <motion.div
                key={dog?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center">
                        <Dog className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-[#1C1917]">{dog?.name ?? 'Unknown'}</h3>
                        <p className="text-sm text-[#78716C]">{dog?.breed ?? 'Mixed Breed'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#78716C] mb-4">
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span className="font-medium text-[#1C1917]">{dog?.weight ?? 0} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Age:</span>
                      <span className="font-medium text-[#1C1917]">{dog?.age ?? 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Life Stage:</span>
                      <span className="font-medium text-[#1C1917] capitalize">{dog?.lifeStage ?? 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Calories:</span>
                      <span className="font-medium text-[#1C1917]">{dog?.dailyCalories ?? 0} kcal</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/generate?dogId=${dog?.id}`} className="flex-1">
                      <Button className="w-full bg-[#F97316] hover:bg-[#ea580c]" size="sm">
                        Generate Recipe
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/my-dogs/${dog?.id}/edit`)}
                      className="border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDog(dog?.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}