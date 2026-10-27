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
      // Visa Success গুলো ফেচ করা
      const { data: visaData } = await supabase
        .from('visa_successes')
        .select('*')
        .eq('category', 'visa')
        .order('created_at', { ascending: false })

      // General Posts বা Updates গুলো ফেচ করা
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
    <main className="min-h-screen bg-slate-50 text-slate-800 font-bn">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>হটলাইন ও ২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট</span>: <strong className="text-white">+880 1848-317583</strong>
          </div>
          <Link href="/admin" className="text-emerald-400 hover:underline font-bold">Admin Panel</Link>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <h1 className="text-2xl font-black text-emerald-800">Hello Apply</h1>
          <a href="https://wa.me/8801848317583" target="_blank" className="bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow">
            সরাসরি ইনকোয়ারি
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-5">
            সহজ, নির্ভুল ও ঝামেলামুক্ত <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">ইন্ডিয়ান ভিসা প্রসেসিং</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            ট্যুরিস্ট, মেডিকেল কিংবা বিজনেস ভিসা—আপনার ফাইল তৈরি থেকে শুরু করে দ্রুত প্রসেসিং পর্যন্ত সব দায়িত্ব আমাদের।
          </p>
          <a href="https://wa.me/8801848317583" target="_blank" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg">
            ভিসার জন্য আবেদন করুন
          </a>
        </div>
      </section>

      {loading ? (
        <p className="text-center py-20 text-slate-500">লোড হচ্ছে...</p>
      ) : (
        <>
          {/* Visa Success Section */}
          <section className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full">ভিসা অ্যাপ্রুভাল রেকর্ড</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">সম্প্রতি প্রাপ্ত সফল ভিসাসমূহ</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Fixed First Promotion Card */}
              <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950 to-emerald-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl">
                <div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">✨ পরবর্তী সুযোগ</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold mt-3">পরবর্তী ভিসার সাফল্য <span className="text-emerald-400">আপনার জন্যই!</span></h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-2">আজই আপনার ইন্ডিয়ান ভিসার ফাইল সাবমিট করুন। শতভাগ নির্ভুল প্রসেসিং।</p>
                </div>
                <a href="https://wa.me/8801848317583" target="_blank" className="mt-6 block text-center bg-emerald-500 hover:bg-emerald-600 font-bold py-3 rounded-xl">
                  আজই আবেদন করুন &rarr;
                </a>
              </div>

              {/* Dynamic Visa Cards */}
              {visas.map((visa: any) => (
                <div key={visa.id} className="bg-white rounded-3xl border border-emerald-500/20 shadow-lg overflow-hidden flex flex-col">
                  <div className="aspect-[16/10] bg-slate-950 overflow-hidden">
                    {visa.image_url && <img src={visa.image_url} alt={visa.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-2">{visa.title}</h4>
                    <a href="https://wa.me/8801848317583" target="_blank" className="w-full text-center bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl">
                      ইনকোয়ারি করুন &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Posts & Updates Section */}
          <section className="py-16 px-4 max-w-7xl mx-auto bg-slate-100 rounded-[2.5rem] my-10">
            <div className="text-center mb-12">
              <span className="bg-orange-500/10 text-orange-600 text-xs px-4 py-1.5 rounded-full font-bold">বিশেষ গ্যালারি ও আপডেট</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3">বিশেষ পোস্ট ও নোটিশসমূহ</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                  <div className="aspect-[3/4] bg-slate-950 overflow-hidden">
                    {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 text-sm mb-2">{post.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  )
}