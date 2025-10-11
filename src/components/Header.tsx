'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'
import { Upload, Sparkles, LogOut, LogIn, Mail } from 'lucide-react'

interface UserProfile {
  full_name?: string
  email?: string
}

interface HeaderProps {
  onAuthClick?: (mode: 'login' | 'signup') => void
}

export default function Header({ onAuthClick }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      if (error) {
        // Only log non-critical errors
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error)
        }
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email
            })
            .select('full_name, email')
            .single()

          if (createError) {
            // Only log if it's not a duplicate key error
            if (createError.code !== '23505') {
              console.error('Error creating profile:', createError)
            }
            return
          }

          setUserProfile(newProfile)
          return
        }
        
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err)
    }
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg animate-pulse"></div>
              <h1 className="text-xl font-bold text-foreground">WardrobeAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 xs:py-3 sm:py-4">
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative group">
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300 animate-glow"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base xs:text-lg sm:text-xl font-bold text-foreground">WardrobeAI</h1>
                {user && (
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Welcome, {userProfile?.full_name || user.email?.split('@')[0] || 'User'}!
                  </p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4">
            <div className="scale-90 xs:scale-95 sm:scale-100">
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-3">
                <Link
                  href="/upload"
                  className="group relative px-1.5 xs:px-2 sm:px-4 py-1.5 xs:py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <div className="absolute inset-0 bg-primary/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Upload className="h-3 w-3 xs:h-4 xs:w-4 sm:mr-2" />
                    <span className="text-xs xs:text-sm">Upload</span>
                  </div>
                </Link>
                <Link
                  href="/outfits"
                  className="group relative px-1.5 xs:px-2 sm:px-4 py-1.5 xs:py-2 bg-secondary text-secondary-foreground border border-border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <div className="absolute inset-0 bg-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Sparkles className="h-3 w-3 xs:h-4 xs:w-4 sm:mr-2" />
                    <span className="text-xs xs:text-sm">Outfits</span>
                  </div>
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.signOut()
                      if (error) {
                        console.error('Error signing out:', error)
                      }
                    } catch (err) {
                      console.error('Unexpected error during sign out:', err)
                    }
                  }}
                  className="px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300 active:scale-95"
                >
                  <LogOut className="h-3 w-3 xs:h-4 xs:w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-3">
                <button
                  onClick={() => onAuthClick?.('login')}
                  className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300 active:scale-95"
                >
                  <span className="text-xs xs:text-sm">Sign In</span>
                </button>
                <button
                  onClick={() => onAuthClick?.('signup')}
                  className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors active:scale-95"
                >
                  <span className="text-xs xs:text-sm">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
