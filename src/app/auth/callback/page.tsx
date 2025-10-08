'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setMessage('Processing authentication...')
        
        // Get the URL hash and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        
        console.log('Hash params:', hashParams.toString())
        console.log('Search params:', searchParams.toString())
        
        console.log('OAuth Callback triggered');
        console.log('Search Params:', searchParams.toString());
        console.log('Hash Params:', window.location.hash);
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);

        // Check if we have an error in the URL
        const error = searchParams.get('error') || hashParams.get('error')
        if (error) {
          console.error('OAuth error:', error)
          setStatus('error')
          setMessage(`OAuth error: ${error}`)
          setTimeout(() => router.push('/?error=oauth_error'), 3000)
          return
        }
        
        // Check if we have an access token
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken) {
          console.log('Access token found, setting session...')
          
          // Set the session manually
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (sessionError) {
            console.error('Session error:', sessionError)
            setStatus('error')
            setMessage(`Session error: ${sessionError.message}`)
            setTimeout(() => router.push('/?error=session_error'), 3000)
            return
          }
          
          if (data.session) {
            console.log('User authenticated:', data.session.user)
            setStatus('success')
            setMessage('Authentication successful! Redirecting...')
            
            // Wait a moment then redirect
            setTimeout(() => {
              router.push('/upload')
            }, 2000)
          } else {
            console.log('No session after setting tokens')
            setStatus('error')
            setMessage('Failed to create session. Redirecting to home...')
            setTimeout(() => router.push('/'), 3000)
          }
        } else {
          // Try to get existing session
          console.log('No access token, checking existing session...')
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Auth callback error:', error)
            setStatus('error')
            setMessage(`Authentication failed: ${error.message}`)
            setTimeout(() => router.push('/?error=auth_failed'), 3000)
            return
          }

          if (data.session) {
            console.log('User authenticated:', data.session.user)
            setStatus('success')
            setMessage('Authentication successful! Redirecting...')
            
            setTimeout(() => {
              router.push('/upload')
            }, 2000)
          } else {
            console.log('No session found')
            setStatus('error')
            setMessage('No session found. Redirecting to home...')
            setTimeout(() => router.push('/'), 3000)
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setTimeout(() => router.push('/?error=unexpected'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing sign in...
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}