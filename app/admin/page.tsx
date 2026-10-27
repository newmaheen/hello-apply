'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FilamentAdminPanel() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Form states
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('visa')
  const [issueDate, setIssueDate] = useState('')
  const [route, setRoute] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const router = useRouter()

  useEffect(() => {
    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
      } else {
        setCheckingAuth(false)
        fetchRecords()
      }
    }
    verifyAuth()
  }, [router])

  const fetchRecords = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('visa_successes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setItems(data)
      setFilteredItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    const result = items.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.route?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(result)
  }, [searchQuery, items])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const resetForm = () => {
    setTitle('')
    setCategory('visa')
    setIssueDate('')
    setRoute('')
    setFile(null)
    setExistingImageUrl('')
    setIsEditing(false)
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setMessage('Title dewa obossoi dorkar!')
      setMessageType('error')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      let imageUrl = existingImageUrl

      // Jodi notun file select kora hoy
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('visa-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('visa-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      }

      if (isEditing && editId) {
        // Update Record
        const { error: updateError } = await supabase
          .from('visa_successes')
          .update({
            title,
            category,
            image_url: imageUrl,
            issue_date: issueDate || null,
            route: route || null
          })
          .eq('id', editId)

        if (updateError) throw updateError
        setMessage('Record সফলভাবে আপডেট করা হয়েছে!')
      } else {
        // Insert Record
        if (!file) {
          setMessage('দয়া করে একটি ছবি সিলেক্ট করুন!')
          setMessageType('error')
          setSubmitting(false)
          return
        }

        const { error: insertError } = await supabase
          .from('visa_successes')
          .insert([{
            title,
            category,
            image_url: imageUrl,
            issue_date: issueDate || null,
            route: route || null
          }])

        if (insertError) throw insertError
        setMessage('নতুন রেকর্ড সফলভাবে তৈরি করা হয়েছে!')
      }

      setMessageType('success')
      resetForm()
      fetchRecords()
    } catch (error: any) {
      console.error('Error:', error)
      setMessage('ত্রুটি দেখা দিয়েছে: ' + error.message)
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: any) => {
    setIsEditing(true)
    setEditId(item.id)
    setTitle(item.title || '')
    setCategory(item.category || 'visa')
    setIssueDate(item.issue_date || '')
    setRoute(item.route || '')
    setExistingImageUrl(item.image_url || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই রেকর্ডটি ডিলিট করতে চান?')) {
      const { error } = await supabase
        .from('visa_successes')
        .delete()
        .eq('id', id)

      if (!error) {
        setItems(items.filter(i => i.id !== id))
        setMessage('রেকর্ড সফলভাবে ডিলিট করা হয়েছে!')
        setMessageType('success')
      } else {
        alert('ডিলিট করতে সমস্যা হয়েছে: ' + error.message)
      }
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Authenticating Filament Panel...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-base font-bold text-white">Hello Apply <span className="text-emerald-400 font-normal">| Filament Admin</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition">
              Live Website &nearr;
            </Link>
            <button onClick={handleLogout} className="text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8 flex-1">

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-2xl text-xs font-medium border flex items-center justify-between ${messageType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <span>{messageType === 'success' ? '✓ ' : '⚠️ '}{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white font-bold">×</button>
          </div>
        )}

        {/* Form Card (Create / Edit) */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Visa Record / Post' : 'Create New Visa / Post'}</h2>
              <p className="text-xs text-slate-400">Manage resource details, routes, and images easily.</p>
            </div>
            {isEditing && (
              <button onClick={resetForm} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="visa">Visa Success (Landscape)</option>
                <option value="post">General Post (Portrait)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Title / Description</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Tourist Visa Approved" 
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {category === 'visa' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Route</label>
                  <input 
                    type="text" 
                    value={route} 
                    onChange={(e) => setRoute(e.target.value)} 
                    placeholder="e.g. Dhaka - Kolkata" 
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Issue Date</label>
                  <input 
                    type="date" 
                    value={issueDate} 
                    onChange={(e) => setIssueDate(e.target.value)} 
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {isEditing ? 'Change Image (Optional)' : 'Upload Image'}
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => e.target.files && setFile(e.target.files[0])} 
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 bg-slate-950 border border-slate-800 rounded-xl p-1.5"
                required={!isEditing}
              />
            </div>

            <div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Record ✓' : 'Create Record 🚀'}
              </button>
            </div>
          </form>
        </div>

        {/* Filament Table Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          
          {/* Table Header / Search Bar */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">All Records ({filteredItems.length})</h3>
              <p className="text-[11px] text-slate-400">List of all uploaded visa success stories and posts.</p>
            </div>
            <div className="w-full sm:w-72">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, route..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading records...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">কোনো রেকর্ড পাওয়া যায়নি।</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-10 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] text-slate-600">No</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200 max-w-xs truncate">{item.title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.category === 'visa' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.route || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.issue_date || '-'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </main>
    </div>
  )
}