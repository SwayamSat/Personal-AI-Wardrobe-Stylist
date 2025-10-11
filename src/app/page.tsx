'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Upload, Sparkles, Shirt, Footprints, ShoppingBag, Watch, ArrowRight, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'
import { LoginForm, SignupForm } from '@/components/AuthForms'

type AuthMode = 'login' | 'signup' | null

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clothingCount, setClothingCount] = useState(0)
  const [authMode, setAuthMode] = useState<AuthMode>(null)

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

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return
    }

    setUserProfile(data)
  }

  const fetchClothingCount = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('clothes')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching clothing count:', error)
      return
    }

    setClothingCount(data?.length || 0)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Personal Wardrobe Stylist</h1>
            </div>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name ? 
                      `Welcome, ${userProfile.full_name.split(' ')[0]}!` : 
                      `Welcome, ${userProfile?.email?.split('@')[0] || 'User'}!`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {userProfile?.email || user.email}
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {clothingCount} items in wardrobe
                </span>
                <Link
                  href="/upload"
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Clothes
                </Link>
                <Link
                  href="/outfits"
                  className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Outfits
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setAuthMode('login')}
                  className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setAuthMode(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800"
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
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You have {clothingCount} items in your digital wardrobe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link
                href="/upload"
                className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Upload className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Clothes</h3>
                <p className="text-gray-600 mb-4">
                  Add photos of your clothing items to build your digital wardrobe.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  Start uploading
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/outfits"
                className="group p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Outfits</h3>
                <p className="text-gray-600 mb-4">
                  Get AI-powered outfit recommendations from your existing wardrobe.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  View outfits
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        ) : (
          // Landing page for non-authenticated users
          <div className="text-center">
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Your Personal AI Wardrobe Stylist
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform your closet into a smart wardrobe. Upload photos of your clothes, 
                and get AI-powered outfit recommendations that work with what you already own.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setAuthMode('signup')}
                  className="inline-flex items-center px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Mail className="h-6 w-6 mr-3" />
                  Sign Up Free
                </button>
                <button
                  onClick={signInWithGoogle}
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border border-gray-300"
                >
                  <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Upload className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload Your Clothes</h3>
                <p className="text-gray-600">
                  Take photos of your tops, bottoms, shoes, and accessories. 
                  Our AI analyzes each item for color, material, and style.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Get AI Recommendations</h3>
                <p className="text-gray-600">
                  Receive personalized outfit combinations based on color harmony, 
                  style consistency, and occasion appropriateness.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <Shirt className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Style with Confidence</h3>
                <p className="text-gray-600">
                  Never say "I have nothing to wear" again. Discover new ways 
                  to wear your existing clothes with professional styling tips.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">1</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Our AI identifies clothing type, color, material, and style from your photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Outfit Generation</h3>
                    <p className="text-sm text-gray-600">
                      Get multiple outfit combinations tailored to different occasions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">3</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Style Tips</h3>
                    <p className="text-sm text-gray-600">
                      Learn why each combination works with professional styling insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-yellow-600">4</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Save & Share</h3>
                    <p className="text-sm text-gray-600">
                      Save your favorite outfits and get fresh recommendations weekly.
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