'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChefHat, Dog, BookOpen, LogOut, Menu, X, Calendar, Activity, Shield, Pill } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show header on auth pages
  if (pathname?.startsWith?.('/auth')) {
    return null;
  }

  // Don't show header if not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  const navItems = [
    { href: '/my-dogs', label: 'My Dogs', icon: Dog },
    { href: '/generate', label: 'Generate Recipe', icon: ChefHat },
    { href: '/recipes', label: 'Saved Recipes', icon: BookOpen },
    { href: '/meal-planner', label: 'Meal Planner', icon: Calendar },
    { href: '/nutrition-tracker', label: 'Nutrition Tracker', icon: Activity },
    { href: '/safety-database', label: 'Safety Database', icon: Shield },
    { href: '/supplement-checker', label: 'Supplement Checker', icon: Pill },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#FDF6E9] shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/my-dogs" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10">
              <Image
                src="/chef-doggo-logo.webp"
                alt="Chef Doggo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl text-[#1C1917] hidden sm:inline">Chef Doggo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={isActive ? 'bg-[#F97316] hover:bg-[#ea580c]' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1C1917] hover:bg-[#FDF6E9] rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#FDF6E9] py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={`w-full justify-start ${isActive ? 'bg-[#F97316] hover:bg-[#ea580c]' : ''}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: '/auth/login' });
                }}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}