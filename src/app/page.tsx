'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Upload, Shirt, Sparkles, LogIn, LogOut } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shirt className="h-8 w-8 text-purple-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                AI Wardrobe Stylist
              </h1>
            </div>
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                ) : user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">Welcome, {user.email}!</span>
                    <Link
                      href="/upload"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Go to Wardrobe
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In with Google</span>
                  </button>
                )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Your Personal
            <span className="text-purple-600"> AI Stylist</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload photos of your clothes and let AI create perfect outfit combinations from your existing wardrobe.
          </p>
          
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Link
                      href="/upload"
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Your Clothes
                    </Link>
                    <Link
                      href="/outfits"
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      View Outfits
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Get Started
                  </button>
                )}
              </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Upload & Tag</h3>
              <p className="mt-1 text-base text-gray-500">
                Upload photos of your clothes and AI automatically categorizes them by type, color, and style.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">AI Outfit Generation</h3>
              <p className="mt-1 text-base text-gray-500">
                Get personalized outfit recommendations based on your existing wardrobe and style preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <Shirt className="h-6 w-6" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Smart Matching</h3>
              <p className="mt-1 text-base text-gray-500">
                AI analyzes color harmony, style compatibility, and occasion appropriateness for perfect matches.
              </p>
            </div>
          </div>
        </div>

            {/* Features Notice */}
            <div className="mt-16 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-2">✨ AI-Powered Features</h3>
              <p className="text-green-800">
                Upload your clothes and get intelligent outfit recommendations powered by AI. 
                Our system automatically categorizes your wardrobe and suggests perfect combinations for any occasion.
              </p>
            </div>
      </main>
    </div>
  )
}
