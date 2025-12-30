'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  elementId: string
  filename?: string
}

export function ExportButton({ elementId, filename = 'habit-tracker' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      const dataUrl = await toPng(element, {
        backgroundColor: '#FFFFFF',
        quality: 1.0,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all font-medium disabled:opacity-50 shadow-sm hover:shadow"
    >
      <Download size={18} />
      <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
    </button>
  )
}
