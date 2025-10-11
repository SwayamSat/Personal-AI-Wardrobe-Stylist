'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Upload, Sparkles, Shirt, Footprints, ShoppingBag, Watch, ArrowRight, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'
import { LoginForm, SignupForm } from '@/components/AuthForms'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/lib/theme'

type AuthMode = 'login' | 'signup' | null

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clothingCount, setClothingCount] = useState(0)
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const { theme } = useTheme()

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
        if (session?.user) {
          setAuthMode(null) // Close auth modal when user logs in
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchClothingCount()
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

  const fetchClothingCount = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('clothes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching clothing count:', error)
        setClothingCount(0)
        return
      }

      setClothingCount(data?.length || 0)
    } catch (err) {
      console.error('Unexpected error in fetchClothingCount:', err)
      setClothingCount(0)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Error signing in:', error)
    }
  }

  const handleAuthSuccess = () => {
    setAuthMode(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>


      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-xs mx-auto">
            <button
              onClick={() => setAuthMode(null)}
              className="absolute -top-2 -right-2 w-8 h-8 !bg-white dark:!bg-black border border-gray-200 dark:border-gray-700 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 z-10"
            >
              ×
            </button>
            {authMode === 'login' ? (
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchMode={() => setAuthMode('signup')}
              />
            ) : (
              <SignupForm 
                onSuccess={handleAuthSuccess}
                onSwitchMode={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          // Authenticated user view
          <div className="text-center relative z-10">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                You have <span className="font-semibold text-primary">{clothingCount}</span> items in your digital wardrobe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link
                href="/upload"
                className="group relative p-8 bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <Upload className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">Upload Clothes</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Add photos of your clothing items to build your digital wardrobe with AI-powered analysis.
                  </p>
                  <div className="flex items-center justify-center text-primary font-semibold group-hover:text-primary/80 transition-colors">
                    Start uploading
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              <Link
                href="/outfits"
                className="group relative p-8 bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-3">Generate Outfits</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Get AI-powered outfit recommendations with professional styling insights and confidence scores.
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                    View outfits
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          // Landing page for non-authenticated users
          <div className="text-center relative z-10">
            <div className="mb-16">
              <h1 className="text-5xl font-bold mb-8 leading-tight">
                <span className="text-foreground">Your Personal AI</span><br />
                <span className="text-primary">Wardrobe Stylist</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Transform your closet into a smart wardrobe. Upload photos of your clothes, 
                and get AI-powered outfit recommendations that work with what you already own.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => setAuthMode('signup')}
                  className="group relative inline-flex items-center px-10 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-primary/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <Mail className="h-6 w-6 mr-3" />
                    Sign Up Free
                  </div>
                </button>
                <button
                  onClick={signInWithGoogle}
                  className="group relative inline-flex items-center px-10 py-4 bg-card text-card-foreground text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-border"
                >
                  <div className="absolute inset-0 bg-accent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="group relative p-8 bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <Upload className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Upload Your Clothes</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Take photos of your tops, bottoms, shoes, and accessories. 
                    Our AI analyzes each item for color, material, and style.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Get AI Recommendations</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Receive personalized outfit combinations based on color harmony, 
                    style consistency, and occasion appropriateness.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                      <Shirt className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">Style with Confidence</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Never say "I have nothing to wear" again. Discover new ways 
                    to wear your existing clothes with professional styling tips.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-card-foreground mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">Smart Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI identifies clothing type, color, material, and style from your photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">Outfit Generation</h3>
                    <p className="text-sm text-muted-foreground">
                      Get multiple outfit combinations tailored to different occasions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-emerald-600">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">Style Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn why each combination works with professional styling insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}