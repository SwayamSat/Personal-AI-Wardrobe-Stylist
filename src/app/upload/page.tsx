'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { analyzeClothingComprehensive } from '@/lib/embeddings'
import { Upload, X, Check, Loader2, Shirt, Sparkles, Trash2, Footprints, ShoppingBag, Watch } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadedClothes, setUploadedClothes] = useState<any[]>([])
  const [aiProcessing, setAiProcessing] = useState(false)
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategorySelection, setShowCategorySelection] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const clothingCategories = [
    { id: 'top', name: 'Tops', icon: Shirt, description: 'Shirts, blouses, t-shirts, sweaters, jackets' },
    { id: 'bottom', name: 'Bottoms', icon: Shirt, description: 'Pants, jeans, shorts, skirts, leggings' },
    { id: 'shoe', name: 'Shoes', icon: Footprints, description: 'Sneakers, boots, heels, sandals, loafers' },
    { id: 'accessory', name: 'Accessories', icon: ShoppingBag, description: 'Bags, hats, jewelry, belts, scarves' }
  ]

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

  const deleteClothingItem = async (itemId: string) => {
    if (!user) return

    // Add to deleting set to show loading state
    setDeletingItems(prev => new Set(prev).add(itemId))

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('clothes')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id)

      if (dbError) {
        console.error('Error deleting clothing item:', dbError)
        alert('Error deleting item. Please try again.')
        return
      }

      // Remove from local state
      setUploadedClothes(prev => prev.filter(item => item.id !== itemId))
      
      console.log('Clothing item deleted successfully')
    } catch (error) {
      console.error('Error deleting clothing item:', error)
      alert('Error deleting item. Please try again.')
    } finally {
      // Remove from deleting set
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const confirmDeleteItem = (itemId: string, itemCategory: string) => {
    if (window.confirm(`Are you sure you want to delete this ${itemCategory} from your wardrobe?`)) {
      deleteClothingItem(itemId)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(files) // Replace instead of append for category-specific uploads
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(newPreviewUrls)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowCategorySelection(false)
    // Trigger file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const resetUpload = () => {
    setSelectedCategory(null)
    setUploadedFiles([])
    setPreviewUrls([])
    setShowCategorySelection(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadFiles = async () => {
    if (!user || uploadedFiles.length === 0 || !selectedCategory) return

    setUploading(true)
    setAiProcessing(true)
    
    try {
      // Ensure user profile exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        alert('Error setting up your profile. Please try again.')
        return
      }

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        
        try {
          // Upload to Supabase Storage
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

          // Show AI processing status
          console.log(`Analyzing ${selectedCategory} item ${i + 1}/${uploadedFiles.length} for pattern and color...`)
          
          // Analyze the clothing item for pattern and color (category is already known)
          const analysis = await analyzeClothingComprehensive(publicUrl)
          
          // Save to database with the selected category
          const { error: dbError } = await supabase
            .from('clothes')
            .insert({
              user_id: user.id,
              image_url: publicUrl,
              category: selectedCategory, // Use selected category instead of AI classification
              color: (analysis as any).color,
              material: (analysis as any).material,
              embedding: (analysis as any).embedding
            })

          if (dbError) {
            console.error('Database error:', dbError)
            console.error('Database error details:', JSON.stringify(dbError, null, 2))
            errorCount++
          } else {
            console.log(`AI analysis complete for ${selectedCategory} item ${i + 1}:`, analysis)
            successCount++
          }
        } catch (itemError) {
          console.error(`Error processing item ${i + 1}:`, itemError)
          errorCount++
        }
      }

      // Refresh clothes list
      await fetchClothes()

      // Reset upload state
      resetUpload()
      
      // Show appropriate success/error message
      if (successCount > 0 && errorCount === 0) {
        alert(`Successfully uploaded and analyzed ${successCount} ${selectedCategory} items!`)
      } else if (successCount > 0 && errorCount > 0) {
        alert(`Successfully uploaded ${successCount} items, but ${errorCount} items failed. Check console for details.`)
      } else {
        alert(`Failed to upload all items. Check console for details.`)
      }
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
          
          {/* Category Selection */}
          {!showCategorySelection && !selectedCategory && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose what you want to upload:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clothingCategories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => setShowCategorySelection(true)}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
                    >
                      {category.id === 'top' && <Shirt className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'bottom' && <Shirt className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'shoe' && <Footprints className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'accessory' && <ShoppingBag className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category Confirmation */}
          {showCategorySelection && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Category:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {clothingCategories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left group"
                    >
                      {category.id === 'top' && <Shirt className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'bottom' && <Shirt className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'shoe' && <Footprints className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      {category.id === 'accessory' && <ShoppingBag className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mb-3" />}
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setShowCategorySelection(false)}
                className="mt-4 text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Upload Area - Only show when category is selected */}
          {selectedCategory && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload {clothingCategories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <button
                  onClick={resetUpload}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Change Category
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Click to upload photos of your {clothingCategories.find(c => c.id === selectedCategory)?.name.toLowerCase()}
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
            </div>
          )}

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
          {uploadedFiles.length > 0 && selectedCategory && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {aiProcessing ? 'Analyzing patterns & colors...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Upload & Analyze {uploadedFiles.length} {clothingCategories.find(c => c.id === selectedCategory)?.name.toLowerCase()}
                  </>
                )}
              </button>
              
              {aiProcessing && (
                <div className="text-center">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI is analyzing patterns, colors, and styles...</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will help create better outfit recommendations
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
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm relative group">
                    {/* Delete Button */}
                    <button
                      onClick={() => confirmDeleteItem(item.id, item.category)}
                      disabled={deletingItems.has(item.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      title={`Delete ${item.category}`}
                    >
                      {deletingItems.has(item.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    
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
                      <div className="text-xs text-gray-500 capitalize mb-1">
                        {item.material}
                      </div>
                      {item.pattern && (
                        <div className="text-xs text-gray-500 capitalize mb-1">
                          Pattern: {item.pattern}
                        </div>
                      )}
                      {item.style && (
                        <div className="text-xs text-gray-500 capitalize">
                          Style: {item.style}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Step 1:</strong> Choose the category of clothes you want to upload</li>
              <li>• <strong>Step 2:</strong> Select and upload photos of items in that category</li>
              <li>• <strong>Step 3:</strong> AI analyzes patterns, colors, and styles for recommendations</li>
              <li>• Take clear, well-lit photos for better analysis</li>
              <li>• Upload one item per photo for best results</li>
              <li>• Hover over items in your wardrobe to delete them</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
