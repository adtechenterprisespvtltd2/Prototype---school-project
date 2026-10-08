'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Award, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[520px] sm:min-h-[600px] overflow-hidden">
      {/* School Building Background Image - Full Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/school-building.png"
          alt="School Building"
          fill
          className="object-cover"
          priority
        />
        {/* Subtle Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

{/* Floating decorative blobs */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-400/25 rounded-full filter blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-4 py-2 rounded-full mb-8 backdrop-blur-md hover:bg-white/20 transition-all animate-shine">
            <Sparkles size={16} className="text-yellow-300 animate-tilt-shake" />
            <span className="text-white text-sm font-semibold">Excellence in Education</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg animate-fade-in-up">
            Shaping Future
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 animate-gradient drop-shadow-lg">
              Leaders
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Where tradition meets innovation. Experience world-class education designed to nurture curiosity, build character, and prepare students for global success.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105 drop-shadow-lg"
            >
              <Award size={20} />
              Admissions Info
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/25 backdrop-blur-md border border-white/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/35 transition-all duration-300 hover:scale-105 drop-shadow-lg"
            >
              <Users size={20} />
              Login Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
