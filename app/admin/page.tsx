'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('visa') // 'visa' বা 'post'
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !file) {
      setMessage('দয়া করে টাইটেল এবং ছবি দিন!')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // ১. Supabase Storage-এ ছবি আপলোড
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('visa-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // ২. পাবলিক URL নেওয়া
      const { data: publicUrlData } = supabase.storage
        .from('visa-images')
        .getPublicUrl(fileName)

      const imageUrl = publicUrlData.publicUrl

      // ৩. ডাটাবেসে সেভ করা
      const { error: dbError } = await supabase
        .from('visa_successes')
        .insert([{ title, category, image_url: imageUrl }])

      if (dbError) throw dbError

      setMessage('সফলভাবে আপলোড হয়েছে!')
      setTitle('')
      setFile(null)
    } catch (error: any) {
      console.error('Error:', error)
      setMessage('আপলোড করতে সমস্যা হয়েছে: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-emerald-900">Admin Upload Panel</h1>
          <Link href="/" className="text-sm text-emerald-700 font-medium hover:underline">Home</Link>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes('সফলভাবে') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              <option value="visa">Visa Success Story</option>
              <option value="post">General Post / Notice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title / Description</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="টাইটেল লিখুন..." 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])} 
              className="w-full text-sm text-slate-500"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full bg-emerald-800 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Item'}
          </button>
        </form>
      </div>
    </main>
  )
}