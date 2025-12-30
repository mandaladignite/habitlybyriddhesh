'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Navbar } from '@/components/Navbar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useTheme } from '@/lib/theme-context'
import { motion } from 'framer-motion'
import { Trash2, Download, Settings as SettingsIcon, User, Database, AlertTriangle } from 'lucide-react'

export function SettingsContent() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isSavingTheme, setIsSavingTheme] = useState(false)

  useEffect(() => {
    const saveTheme = async () => {
      setIsSavingTheme(true)
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme }),
        })
      } catch (error) {
        console.error('Error saving theme:', error)
      } finally {
        setIsSavingTheme(false)
      }
    }

    saveTheme()
  }, [theme])

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your habits and data. Are you absolutely sure?')) {
      return
    }

    try {
      alert('Account deletion is not yet implemented. Please contact support.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">
              Settings
            </h1>
          </div>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Appearance
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-slate-800 font-medium mb-1">Theme</p>
                  <p className="text-sm text-slate-600">
                    Choose your preferred color theme
                  </p>
                </div>
                <ThemeSwitcher />
              </div>
              {isSavingTheme && (
                <p className="text-sm text-slate-500 mt-3">Saving...</p>
              )}
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Account
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-800 font-medium mb-1">Email</p>
                  <p className="text-sm text-slate-600">
                    Your email address is used for authentication
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Data Export */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Data
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-800 font-medium mb-1">Export Data</p>
                  <p className="text-sm text-slate-600 mb-3">
                    Download your habit tracking data
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium">
                    <Download size={18} />
                    Export Data
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-red-600">
                  Danger Zone
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-800 font-medium mb-1">Delete Account</p>
                  <p className="text-sm text-slate-600 mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
