'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Settings, Download } from 'lucide-react'

interface CalendarSettingsProps {
  selectedYear: number
  selectedMonth: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
}

export function CalendarSettings({ selectedYear, selectedMonth, onYearChange, onMonthChange }: CalendarSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  const handleExportCalendar = () => {
    // Create a simple text representation of the calendar
    const monthName = months[selectedMonth - 1]
    const calendarText = `HABIT TRACKER - ${monthName} ${selectedYear}
CALENDAR SETTINGS
YEAR: ${selectedYear}
MONTH: ${selectedMonth} (${monthName})

Generated on: ${new Date().toLocaleDateString()}

Download the offline version: CLICK HERE`

    // Create and download file
    const blob = new Blob([calendarText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habit-tracker-${monthName.toLowerCase()}-${selectedYear}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Calendar Settings</h3>
              <p className="text-sm text-muted-foreground">
                {months[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCalendar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Download Calendar Settings"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Month
              </label>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => onMonthChange(index + 1)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      selectedMonth === index + 1
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Current selection: {months[selectedMonth - 1]} {selectedYear}</div>
                <div>• Days in month: {new Date(selectedYear, selectedMonth, 0).getDate()}</div>
                <div>• Week starts: Monday</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
