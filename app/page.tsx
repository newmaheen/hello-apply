'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Custom Counter Hook for Animated Numbers
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])

  return count
}

// Live Countdown Timer Hook
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

export default function Home() {
  const [visas, setVisas] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState<'bn' | 'en'>('bn')
  
  const [visaPage, setVisaPage] = useState(1)
  const visasPerPage = 5

  const postsScrollRef = useRef<HTMLDivElement>(null)

  // Animated Numbers States
  const experienceCount = useCounter(10, 2000)
  const visaCount = useCounter(200, 2500)
  const clientCount = useCounter(500, 3000)

  // Live Countdown Target (Apni ekhane target date change korte parben ba admin theke dynamic korte parben)
  const countdownTarget = "2026-11-05T12:00:00"
  const { days, hours, minutes, seconds } = useCountdown(countdownTarget)

  useEffect(() => {
    const savedLang = localStorage.getItem('hello_apply_lang') as 'bn' | 'en'
    if (savedLang) {
      setLang(savedLang)
    }

    async function fetchData() {
      const { data: visaData } = await supabase
        .from('visa_successes')
        .select('*')
        .eq('category', 'visa')
        .order('created_at', { ascending: false })

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

  const switchLanguage = (selectedLang: 'bn' | 'en') => {
    setLang(selectedLang)
    localStorage.setItem('hello_apply_lang', selectedLang)
  }

  const indexOfLastVisa = visaPage * visasPerPage
  const indexOfFirstVisa = indexOfLastVisa - visasPerPage
  const currentVisas = visas.slice(indexOfFirstVisa, indexOfLastVisa)
  const totalVisaPages = Math.ceil(visas.length / visasPerPage)

  const scrollPosts = (direction: 'left' | 'right') => {
    if (postsScrollRef.current) {
      const { scrollLeft, clientWidth } = postsScrollRef.current
      const scrollAmount = clientWidth * 0.75
      postsScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`scroll-smooth antialiased selection:bg-emerald-500 selection:text-white transition-all duration-300 ${lang === 'en' ? 'font-en' : 'font-bn'} bg-slate-50 text-slate-800`}>
      
      {/* Top Utility & Language Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'bn' ? 'হটলাইন ও ২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট' : 'Hotline & 24/7 WhatsApp Support'}</span>: <strong className="text-white">+880 1848-317583</strong>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto">
            <span className="sm:hidden text-[11px] text-emerald-400 font-bold">Hello Apply Visa Portal</span>
            <div className="inline-flex items-center bg-slate-800 p-0.5 rounded-full border border-slate-700 shadow-inner">
              <button 
                onClick={() => switchLanguage('bn')} 
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${lang === 'bn' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                বাং
              </button>
              <button 
                onClick={() => switchLanguage('en')} 
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${lang === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar with Logo Added & Admin Link Removed */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-3">
              <img 
                src="/hello-apply.png" 
                alt="Hello Apply Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-md border border-emerald-100" 
              />
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-800">Hello Apply</span>
            </a>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#success-section" className="hover:text-emerald-600 transition">
              {lang === 'bn' ? 'সফল ভিসাসমূহ' : 'Visa Success'}
            </a>
            <a href="#posts-section" className="hover:text-emerald-600 transition">
              {lang === 'bn' ? 'বিশেষ পোস্ট ও আপডেট' : 'Updates & Gallery'}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/8801848317583?text=Hello%20Apply,%20India%20Visa%20samporke%20jante%20cai" target="_blank" 
               className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20">
              {lang === 'bn' ? 'সরাসরি ইনকোয়ারি' : 'Direct Inquiry'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner with Live Digital Countdown Timer */}
      <section className="relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white py-16 sm:py-24 px-4 overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white border border-emerald-400/40 text-[11px] sm:text-sm px-5 py-2.5 rounded-full font-bold uppercase tracking-wider mb-6 sm:mb-8 shadow-2xl backdrop-blur-md">
            <span>🏆</span> 
            <span>{lang === 'bn' ? '১০ বছরের ভারতীয় ভিসা প্রসেসিং সফল অভিজ্ঞতা!' : '10 Years of Proven Indian Visa Processing Experience!'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 sm:mb-7 tracking-tight">
            {lang === 'bn' ? 'সহজ, নির্ভুল ও ঝামেলামুক্ত' : 'Easy, Accurate & Hassle-Free'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              {lang === 'bn' ? 'ইন্ডিয়ান ভিসা প্রসেসিং' : 'Indian Visa Processing'}
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            {lang === 'bn' 
              ? 'ট্যুরিস্ট, মেডিকেল কিংবা বিজনেস ভিসা—আপনার ফাইল তৈরি থেকে শুরু করে দ্রুত প্রসেসিং পর্যন্ত সব দায়িত্ব আমাদের।' 
              : 'Tourist, Medical, or Business Visa—from file preparation to fast processing, we handle everything for you.'}
          </p>

          {/* --- LIVE DIGITAL COUNTDOWN TIMER WIDGET --- */}
          <div className="max-w-xl mx-auto mb-10 bg-slate-900/80 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="text-xs sm:text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">
              ⏳ {lang === 'bn' ? 'পরবর্তী ভিসা স্লট বুকিংয়ের বাকি সময়:' : 'Next Visa Slot Closing In:'}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-xl sm:text-3xl font-black text-white">{days}</span>
                <span className="block text-[10px] text-slate-400 uppercase">{lang === 'bn' ? 'দিন' : 'Days'}</span>
              </div>
              <div className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-xl sm:text-3xl font-black text-emerald-400">{hours}</span>
                <span className="block text-[10px] text-slate-400 uppercase">{lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</span>
              </div>
              <div className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-xl sm:text-3xl font-black text-amber-400">{minutes}</span>
                <span className="block text-[10px] text-slate-400 uppercase">{lang === 'bn' ? 'মিনিট' : 'Mins'}</span>
              </div>
              <div className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800">
                <span className="text-xl sm:text-3xl font-black text-orange-400">{seconds}</span>
                <span className="block text-[10px] text-slate-400 uppercase">{lang === 'bn' ? 'সেকেন্ড' : 'Secs'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <a href="#success-section" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 transition text-sm backdrop-blur-sm shadow-lg">
              {lang === 'bn' ? 'আমাদের সাকসেস দেখুন' : 'View Success Stories'}
            </a>
            <a href="https://wa.me/8801848317583?text=India%20Visa%20Application%20korbo" target="_blank" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-orange-500/20 transition text-sm">
              {lang === 'bn' ? 'ভিসার জন্য আবেদন করুন' : 'Apply for Visa'}
            </a>
          </div>

          {/* Animated Counting Numbers Strip */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-14 pt-8 border-t border-emerald-500/20 text-center">
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{experienceCount}+</div>
              <div className="text-[10px] sm:text-xs text-slate-300 mt-1">{lang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'Years Experience'}</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-orange-400">{visaCount}+</div>
              <div className="text-[10px] sm:text-xs text-slate-300 mt-1">{lang === 'bn' ? 'সফল ভিসা প্রসেসিং' : 'Visas Processed'}</div>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-teal-400">{clientCount}+</div>
              <div className="text-[10px] sm:text-xs text-slate-300 mt-1">{lang === 'bn' ? 'সন্তুষ্ট গ্রাহক' : 'Happy Clients'}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 1. Visa Success Section (Unchanged Grid Structure) */}
      <section id="success-section" className="py-16 sm:py-24 px-2 sm:px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">
            {lang === 'bn' ? 'ভিসা অ্যাপ্রুভাল রেকর্ড' : 'Visa Approval Records'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            {lang === 'bn' ? 'সম্প্রতি প্রাপ্ত সফল ভিসাসমূহ' : 'Recently Approved Visas'}
          </h2>
          <p className="text-slate-500 mt-2 sm:mt-3 text-xs sm:text-base max-w-xl mx-auto px-2">
            {lang === 'bn' ? 'আমাদের মাধ্যমে সফলভাবে ভিসা প্রাপ্ত সম্মানিত গ্রাহকদের কিছু রেকর্ড' : 'Some records of our honored clients who successfully received visas through us'}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-slate-500 py-12">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              
              {visaPage === 1 && (
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/50 shadow-2xl p-4 sm:p-6 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 shadow-sm">
                      {lang === 'bn' ? '✨ পরবর্তী সুযোগ' : '✨ Next Opportunity'}
                    </span>
                    <h3 className="text-base sm:text-2xl font-extrabold leading-snug mb-2 sm:mb-3">
                      {lang === 'bn' ? 'পরবর্তী ভিসার সাফল্য' : 'Next Visa Success'} <br />
                      <span className="text-emerald-400">{lang === 'bn' ? 'আপনার জন্যই!' : 'For You!'}</span>
                    </h3>
                    <p className="text-slate-300 text-[11px] sm:text-sm leading-relaxed mb-4 sm:mb-6">
                      {lang === 'bn' 
                        ? 'আজই আপনার ইন্ডিয়ান ভিসার ফাইল সাবমিট করুন। শতভাগ নির্ভুল প্রসেসিং ও দ্রুত অনুমোদনের নিশ্চয়তা।' 
                        : 'Submit your Indian visa file today. 100% accurate processing & fast approval guarantee.'}
                    </p>
                  </div>
                  <div className="relative z-10">
                    <a href="https://wa.me/8801848317583?text=Ami%20India%20Visa%20korbo" target="_blank" 
                       className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-[11px] sm:text-sm font-bold py-2.5 sm:py-3 px-4 rounded-xl shadow-xl transition-all">
                      {lang === 'bn' ? 'আজই আবেদন করুন' : 'Apply Today'} &rarr;
                    </a>
                  </div>
                </div>
              )}

              {currentVisas.map((visa: any) => (
                <div key={visa.id} className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group relative">
                  <div className="absolute top-0 inset-x-0 h-1.5 sm:h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

                  <div className="relative bg-slate-900 aspect-[16/10] w-full flex items-center justify-center overflow-hidden border-b border-emerald-100 mt-1.5">
                    {visa.image_url ? (
                      <img src={visa.image_url} alt={visa.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <span className="text-slate-400 text-xs">No Image</span>
                    )}
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] sm:text-xs font-black px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-2xl border border-emerald-300/40 flex items-center gap-1">
                      <span>✓</span> Visa Approved
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white via-emerald-50/20 to-white">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-base mb-2 sm:mb-3 leading-snug line-clamp-2">{visa.title}</h4>
                      <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-slate-700 mb-3 sm:mb-4 bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-emerald-500/15 shadow-inner">
                        {visa.route && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-semibold">{lang === 'bn' ? 'অনুমোদিত রুট:' : 'Approved Route:'}</span>
                            <strong className="text-emerald-950 font-bold truncate max-w-[100px] sm:max-w-[140px]">{visa.route}</strong>
                          </div>
                        )}
                        {visa.issue_date && (
                          <div className="flex justify-between items-center border-t border-slate-100 pt-1 sm:pt-1.5">
                            <span className="text-slate-400 font-semibold">{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                            <span className="font-bold text-slate-800">{visa.issue_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <a href="https://wa.me/8801848317583?text=Ami%20India%20Visa%20korbo" target="_blank" 
                       className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 hover:from-emerald-600 hover:to-teal-600 text-white text-[11px] sm:text-xs font-extrabold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all shadow-md">
                      {lang === 'bn' ? 'ইনকোয়ারি করুন' : 'Inquire Now'} &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {totalVisaPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button onClick={() => setVisaPage(prev => Math.max(prev - 1, 1))} disabled={visaPage === 1} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 shadow-sm">&larr; {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}</button>
                <span className="text-xs font-bold text-slate-600">Page {visaPage} of {totalVisaPages}</span>
                <button onClick={() => setVisaPage(prev => Math.min(prev + 1, totalVisaPages))} disabled={visaPage === totalVisaPages} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 shadow-md">{lang === 'bn' ? 'পরবর্তী (Next)' : 'Next'} &rarr;</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 2. Portrait Posts Section (Smooth Marquee) */}
      <section id="posts-section" className="py-16 sm:py-24 px-2 sm:px-4 max-w-7xl mx-auto bg-slate-100/70 rounded-[2.5rem] my-12 border border-slate-200/60 shadow-inner relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 px-2">
          <div>
            <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              {lang === 'bn' ? 'বিশেষ গ্যালারি ও আপডেট' : 'Special Gallery & Updates'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              {lang === 'bn' ? 'আমাদের পোর্ট্রেইট পোস্ট ও ছবিসমূহ' : 'Our Portrait Posts & Photos'}
            </h2>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="relative w-full overflow-hidden group">
            <div className="flex gap-4 sm:gap-6 w-max animate-marquee hover:[animation-play-state:paused]">
              {posts.map((post: any) => (
                <div key={post.id} className="w-[200px] sm:w-[260px] bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group/card flex-shrink-0">
                  <div className="relative bg-slate-950 aspect-[3/4] flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                    ) : (
                      <span className="text-slate-500 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 leading-snug line-clamp-2">{post.title}</h3>
                      <p className="text-[10px] text-slate-400 font-medium"><span>{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span> {post.issue_date || post.created_at?.substring(0, 10)}</p>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100">
                      <a href="https://wa.me/8801848317583?text=Hello%20HelloApply,%20ei%20update%20somporke%20jante%20cai" target="_blank" className="w-full flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-orange-600 text-white text-[11px] font-bold py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl transition shadow">
                        {lang === 'bn' ? 'বিস্তারিত জানুন' : 'Learn More'} &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {posts.map((post: any) => (
                <div key={`dup-${post.id}`} className="w-[200px] sm:w-[260px] bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group/card flex-shrink-0">
                  <div className="relative bg-slate-950 aspect-[3/4] flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                    ) : (
                      <span className="text-slate-500 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 leading-snug line-clamp-2">{post.title}</h3>
                      <p className="text-[10px] text-slate-400 font-medium"><span>{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span> {post.issue_date || post.created_at?.substring(0, 10)}</p>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100">
                      <a href="https://wa.me/8801848317583?text=Hello%20HelloApply,%20ei%20update%20somporke%20jante%20cai" target="_blank" className="w-full flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-orange-600 text-white text-[11px] font-bold py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-xl transition shadow">
                        {lang === 'bn' ? 'বিস্তারিত জানুন' : 'Learn More'} &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">{lang === 'bn' ? 'কোনো পোর্ট্রেইট পোস্ট পাওয়া যায়নি।' : 'No portrait posts found.'}</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-slate-300 pt-16 pb-8 border-t-2 border-emerald-500/30 text-xs relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-center md:text-left relative z-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/hello-apply.png" alt="Hello Apply" className="w-10 h-10 object-contain rounded-xl" />
              <span className="text-2xl font-black text-white">Hello Apply</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {lang === 'bn' ? 'আপনার বিশ্বস্ত ইন্ডিয়ান ভিসা প্রসেসিং পার্টনার। শতভাগ নির্ভুল ও দ্রুত সেবা প্রদানই আমাদের লক্ষ্য।' : 'Your trusted Indian visa processing partner. 100% accurate and fast service is our goal.'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 bg-slate-800/60 p-6 rounded-2xl border border-emerald-500/30 shadow-xl backdrop-blur-sm">
            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
              💬 {lang === 'bn' ? 'সরাসরি যোগাযোগ' : 'Direct Contact'}
            </span>
            <p className="text-slate-300 font-semibold text-sm">{lang === 'bn' ? 'হটলাইন / হোয়াটসঅ্যাপ সাপোর্ট:' : 'Hotline / WhatsApp Support:'}</p>
            <a href="https://wa.me/8801848317583?text=Hello%20HelloApply,%20India%20Visa%20samporke%20jante%20cai" target="_blank" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:scale-105">
              <span>📱 +880 1848-317583</span>
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-1">{lang === 'bn' ? 'আমাদের সোশ্যাল মিডিয়া' : 'Our Social Media'}</h4>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/helloapplybd" target="_blank" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30">
                <span className="text-sm">🌐</span> Facebook Page
              </a>
              <a href="https://wa.me/8801848317583" target="_blank" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/30">
                <span className="text-sm">💬</span> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 mt-12 pt-6 text-center text-slate-500 text-xs relative z-10">
          <p>&copy; 2026 Hello Apply. <span>{lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</span></p>
        </div>
      </footer>

    </div>
  )
}