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

export default function Header() {
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
        console.error('Error fetching user profile:', error)
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...')
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
            console.error('Error creating profile:', createError)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300 animate-glow"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">WardrobeAI</h1>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Welcome, {userProfile?.full_name || user.email?.split('@')[0] || 'User'}!
                  </p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/upload"
                  className="group relative px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-primary/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </div>
                </Link>
                <Link
                  href="/outfits"
                  className="group relative px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Outfits
                  </div>
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/"
                  className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2 inline" />
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2 inline" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
