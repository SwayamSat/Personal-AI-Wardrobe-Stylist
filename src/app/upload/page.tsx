'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Upload, Loader2, Check, X, Shirt, Footprints, ShoppingBag, Watch } from 'lucide-react'
import Link from 'next/link'

interface ClothingItem {
  id: string
  user_id: string
  image_url: string
  category: 'top' | 'bottom' | 'shoe' | 'accessory'
  color: string
  material: string
  style?: string
  created_at: string
}

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategorySelection, setShowCategorySelection] = useState(true)
  const [uploadedItems, setUploadedItems] = useState<ClothingItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const categories = [
    { id: 'top', name: 'Tops', icon: Shirt, description: 'Shirts, blouses, t-shirts, sweaters' },
    { id: 'bottom', name: 'Bottoms', icon: Shirt, description: 'Pants, jeans, shorts, skirts' },
    { id: 'shoe', name: 'Shoes', icon: Footprints, description: 'Sneakers, boots, heels, sandals' },
    { id: 'accessory', name: 'Accessories', icon: ShoppingBag, description: 'Bags, hats, jewelry, belts' }
  ]

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
      fetchUploadedItems()
    }
  }, [user])

  const fetchUploadedItems = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
      return
    }

    setUploadedItems(data || [])
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
    setError(null)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowCategorySelection(false)
  }

  const resetUpload = () => {
    setFiles([])
    setSelectedCategory(null)
    setShowCategorySelection(true)
    setError(null)
    setSuccess(null)
  }

  const uploadFiles = async () => {
    if (!user || !selectedCategory || files.length === 0) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Ensure user profile exists
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString()
      })

      let successCount = 0
      let errorCount = 0

      for (const file of files) {
        try {
          // Upload to storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('clothes')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            errorCount++
            continue
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('clothes')
            .getPublicUrl(fileName)

          // Convert image to base64 for analysis
          const response = await fetch(publicUrl)
          const blob = await response.blob()
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })

          // Analyze with professional Gemini service
          console.log('🔍 Professional analysis starting...')
          const analysisResponse = await fetch('/api/analyze-clothing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
          })

          let analysis = {
            category: selectedCategory as 'top' | 'bottom' | 'shoe' | 'accessory',
            color: 'black',
            material: 'cotton',
            style: 'casual',
            confidence: 0.5
          }

          if (analysisResponse.ok) {
            // Check if response is JSON before parsing
            const contentType = analysisResponse.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              const analysisData = await analysisResponse.json()
              if (analysisData.success) {
                analysis = {
                  category: selectedCategory as 'top' | 'bottom' | 'shoe' | 'accessory',
                  color: analysisData.analysis.color,
                  material: analysisData.analysis.material,
                  style: analysisData.analysis.style,
                  confidence: analysisData.analysis.confidence
                }
                console.log('✅ Professional analysis:', analysis)
                if (analysisData.fallback) {
                  console.log('⚠️ Used fallback analysis due to:', analysisData.error)
                }
              }
            } else {
              console.log('⚠️ Non-JSON response from analysis API')
            }
          } else {
            console.log('⚠️ Analysis failed with status:', analysisResponse.status)
          }

          // Save to database with fallback for missing columns
          const insertData = {
            user_id: user.id,
            image_url: publicUrl,
            category: analysis.category,
            color: analysis.color,
            material: analysis.material
          }

          // Try to add style if the column exists
          try {
            const { error: dbError } = await supabase
              .from('clothes')
              .insert({
                ...insertData,
                style: analysis.style
              })

            if (dbError) {
              console.log('⚠️ Style column might not exist, trying without it...')
              
              // Fallback: insert without style column
              const { error: fallbackError } = await supabase
                .from('clothes')
                .insert(insertData)

              if (fallbackError) {
                console.error('❌ Database error:', fallbackError)
                console.error('📊 Insert data:', insertData)
                errorCount++
              } else {
                successCount++
                console.log(`✅ Uploaded ${file.name} (without style)`)
              }
            } else {
              successCount++
              console.log(`✅ Uploaded ${file.name}`)
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError)
            console.error('📊 Insert data:', insertData)
            errorCount++
          }

        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError)
          errorCount++
        }
      }

      // Show results
      if (successCount > 0) {
        setSuccess(`Successfully uploaded ${successCount} ${selectedCategory}${successCount > 1 ? 's' : ''}!`)
        await fetchUploadedItems()
        resetUpload()
      }

      if (errorCount > 0) {
        setError(`Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Delete error:', error)
        return
      }

      await fetchUploadedItems()
      console.log('✅ Item deleted')
    } catch (error) {
      console.error('Delete error:', error)
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
          <Link href="/" className="text-purple-600 hover:text-purple-700">Go back to home</Link>
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
              Personal Wardrobe Stylist
            </Link>
            <div className="flex space-x-4">
              <Link href="/outfits" className="text-gray-700 hover:text-gray-900">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Clothes</h1>
          <p className="text-gray-600">
            Upload photos of your clothing items to build your digital wardrobe. 
            Our AI will analyze each item to help create perfect outfit combinations.
          </p>
        </div>

        {/* Category Selection */}
        {showCategorySelection && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What are you uploading?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left"
                  >
                    <IconComponent className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Upload Area */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <button
                onClick={resetUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-900 mb-2">
                  Choose photos to upload
                </span>
                <span className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 10MB each
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Selected files:</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={uploadFiles}
                  disabled={uploading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Uploading and analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload {files.length} file{files.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Uploaded Items */}
        {uploadedItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Wardrobe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={`${item.color} ${item.category}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.category}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Color: {item.color}</div>
                      <div>Material: {item.material}</div>
                      {item.style && <div>Style: {item.style}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}