'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [visas, setVisas] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // ১. Visa Success ফেচ করা
      const { data: visaData } = await supabase
        .from('visa_successes')
        .select('*')
        .eq('category', 'visa')
        .order('created_at', { ascending: false })

      // ২. Posts ফেচ করা
      const { data: postData } = await supabase
        .from('visa_successes')
        .select('*')
        .eq('category', 'post')
        .order('created_at', { ascending: false })

      setVisas(visaData || [])
      setPosts(postData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Hello Apply</h1>
            <p className="text-gray-600 text-sm">Visa Consultancy & Updates Portal</p>
          </div>
          <Link href="/admin" className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-900 text-sm">
            Admin Panel
          </Link>
        </header>

        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading...</p>
        ) : (
          <div className="space-y-12">
            {/* Visa Success Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Visa Success Stories</h2>
              {visas.length === 0 ? (
                <p className="text-gray-500 bg-white p-6 rounded-xl shadow-sm">No visa success stories found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visas.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Posts / Notices Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">General Posts & Notices</h2>
              {posts.length === 0 ? (
                <p className="text-gray-500 bg-white p-6 rounded-xl shadow-sm">No posts found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {posts.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover" />}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}