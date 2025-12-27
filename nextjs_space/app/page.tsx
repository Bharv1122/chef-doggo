'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChefHat, Heart, Shield, TrendingUp, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/my-dogs');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FDF6E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDF6E9]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative w-40 h-40 mx-auto mb-8">
            <Image
              src="/chef-doggo-logo.webp"
              alt="Chef Doggo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1C1917] mb-4">
            Turn <span className="text-[#F97316]">Kibble</span> into <span className="text-[#F97316]">Cuisine</span>
          </h1>
          <p className="text-xl text-[#78716C] mb-8 max-w-2xl mx-auto">
            Transform commercial dog kibble into personalized homemade recipes backed by veterinary nutrition
            science and AAFCO standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-[#F97316] hover:bg-[#ea580c] text-white px-8">
                <ChefHat className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917] mb-4">How It Works</h2>
            <p className="text-lg text-[#78716C]">
              Simple steps to create veterinary-approved homemade meals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Create Dog Profile',
                description: 'Tell us about your dog: breed, weight, age, activity level, and any health conditions.',
                color: '#F97316',
              },
              {
                icon: BookOpen,
                title: 'Enter Kibble Nutrition',
                description: 'Input the nutritional values from your current kibble to ensure balanced replacement.',
                color: '#22C55E',
              },
              {
                icon: Sparkles,
                title: 'Get Custom Recipe',
                description: 'Receive AAFCO-compliant recipes with ingredients, instructions, and supplement recommendations.',
                color: '#F59E0B',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow bg-[#FDF6E9] border-none">
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${step.color}20` }}
                      >
                        <Icon className="w-8 h-8" style={{ color: step.color }} />
                      </div>
                      <h3 className="text-xl font-semibold text-[#1C1917] mb-2">{step.title}</h3>
                      <p className="text-[#78716C]">{step.description}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nutrition Science */}
      <section className="py-16 px-4 bg-[#FDF6E9]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C1917] mb-4">Built on Science</h2>
            <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
              Every recipe follows AAFCO nutritional standards and veterinary best practices
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: 'AAFCO Compliance',
                description: 'All recipes meet Association of American Feed Control Officials standards for complete and balanced nutrition.',
              },
              {
                icon: TrendingUp,
                title: 'Calorie Calculated',
                description: 'Personalized daily calorie needs based on your dog\'s weight, age, and activity level.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
                    <Icon className="w-10 h-10 text-[#F97316] mb-4" />
                    <h3 className="text-xl font-semibold text-[#1C1917] mb-2">{feature.title}</h3>
                    <p className="text-[#78716C]">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#F97316] text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Dog's Meals?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join Chef Doggo today and start creating nutritious, homemade meals your dog will love.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="bg-white text-[#F97316] hover:bg-gray-100 px-8">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#1C1917] text-white text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-5 h-5" />
            <span className="font-semibold">Chef Doggo</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Turn Kibble into Cuisine - Veterinary nutrition science for your best friend
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Chef Doggo. All recipes are for informational purposes. Always
            consult your veterinarian.
          </p>
        </div>
      </footer>
    </div>
  );
}