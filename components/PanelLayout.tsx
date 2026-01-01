'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Settings, 
  Target,
  ListTodo
} from 'lucide-react'

interface PanelLayoutProps {
  children: React.ReactNode
  activePanel: string
  onPanelChange: (panel: string) => void
}

const panels = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'progress', name: 'Progress', icon: TrendingUp },
  { id: 'habits', name: 'Habits', icon: ListTodo },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'calendar', name: 'Calendar', icon: Calendar },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export function PanelLayout({ children, activePanel, onPanelChange }: PanelLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-card border-r border-border shadow-lg relative"
      >
        <div className="p-4">
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Target size={16} className="text-muted-foreground" />
            </motion.div>
          </button>

          {/* Panel Navigation */}
          <nav className="space-y-2">
            {panels.map((panel) => {
              const Icon = panel.icon
              return (
                <motion.button
                  key={panel.id}
                  onClick={() => onPanelChange(panel.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    activePanel === panel.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{panel.name}</span>
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
