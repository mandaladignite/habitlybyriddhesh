'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { ArrowRight, Check, Sparkles, TrendingUp, Target, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Build Better Habits</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Track your habits with
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                precision & style
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              A modern habit tracker that helps you build consistency, visualize progress, and achieve your goals with beautiful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Start Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">December 2024</h3>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center text-xs text-slate-500 font-semibold">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {['💧 Drink Water', '🏃 Exercise', '📚 Read'].map((habit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700 min-w-[120px]">{habit}</span>
                      <div className="flex gap-1.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all ${
                              i < 5
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white shadow-md'
                                : 'border-slate-300 bg-slate-50 text-slate-400'
                            }`}
                          >
                            {i < 5 && '✓'}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to help you build and maintain better habits
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: <BarChart3 className="w-8 h-8" />,
              title: 'Performance Analytics', 
              desc: 'Visual charts and insights to track your progress over time',
              color: 'from-blue-500 to-indigo-600'
            },
            { 
              icon: <Target className="w-8 h-8" />,
              title: 'Smart Streaks', 
              desc: 'Automatic streak tracking to keep you motivated and consistent',
              color: 'from-emerald-500 to-green-600'
            },
            { 
              icon: <TrendingUp className="w-8 h-8" />,
              title: 'Visual Progress', 
              desc: 'Beautiful monthly grid view inspired by Excel trackers',
              color: 'from-purple-500 to-pink-600'
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-xl transition-all"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-12 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to transform your habits?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of people building better habits, one day at a time.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
          <p>© 2024 Habitly. Made with ❤️ for better habits.</p>
        </div>
      </footer>
    </div>
  )
}
