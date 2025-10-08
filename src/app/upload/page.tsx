'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { analyzeClothing } from '@/lib/embeddings'
import { Upload, X, Check, Loader2, Shirt, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadedClothes, setUploadedClothes] = useState<any[]>([])
  const [aiProcessing, setAiProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (user) {
      fetchClothes()
    }
  }, [user])

  const fetchClothes = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clothes:', error)
      return
    }

    setUploadedClothes(data || [])
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadFiles = async () => {
    if (!user || uploadedFiles.length === 0) return

    setUploading(true)
    setAiProcessing(true)
    
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('clothes')
          .upload(fileName, file)
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('clothes')
          .getPublicUrl(fileName)

        // Show AI processing status
        console.log(`Analyzing clothing item ${i + 1}/${uploadedFiles.length} with AI...`)
        
        // Analyze the clothing item with AI
        const analysis = await analyzeClothing(publicUrl)
        
        // Save to database
        const { error: dbError } = await supabase
          .from('clothes')
          .insert({
            user_id: user.id,
            image_url: publicUrl,
            category: (analysis as any).category,
            color: (analysis as any).color,
            material: (analysis as any).material,
            embedding: (analysis as any).embedding
          })

        if (dbError) {
          console.error('Database error:', dbError)
          console.error('Database error details:', JSON.stringify(dbError, null, 2))
        } else {
          console.log(`AI analysis complete for item ${i + 1}:`, analysis)
        }
      }

      // Refresh clothes list
      await fetchClothes()

      // Clear uploaded files
      setUploadedFiles([])
      setPreviewUrls([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      alert(`Successfully uploaded and analyzed ${uploadedFiles.length} clothing items with AI!`)
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
      setAiProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to upload clothes</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              AI Wardrobe Stylist
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/outfits"
                className="text-gray-700 hover:text-gray-900"
              >
                View Outfits
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Your Clothes</h1>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Click to upload photos of your clothes
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  PNG, JPG, JPEG up to 10MB each
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Preview Grid */}
          {previewUrls.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preview ({previewUrls.length} files)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {aiProcessing ? 'AI Analyzing...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Upload & Analyze {uploadedFiles.length} items
                  </>
                )}
              </button>
              
              {aiProcessing && (
                <div className="text-center">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI is analyzing your clothes...</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This may take a moment on first load while the AI model downloads
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Uploaded Clothes Display */}
          {uploadedClothes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Wardrobe ({uploadedClothes.length} items)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {uploadedClothes.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={item.image_url}
                      alt={`Clothing item ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shirt className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600 capitalize">
                          {item.color}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {item.material}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Upload Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take clear, well-lit photos of your clothes</li>
              <li>• Include the full item in the frame</li>
              <li>• Upload one item per photo for best results</li>
              <li>• The AI will automatically categorize and tag your items</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
