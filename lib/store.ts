import { create } from 'zustand'

interface AppState {
  selectedMonth: Date
  setSelectedMonth: (date: Date) => void
  isAddHabitModalOpen: boolean
  setIsAddHabitModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonth: new Date(),
  setSelectedMonth: (date: Date) => set({ selectedMonth: date }),
  isAddHabitModalOpen: false,
  setIsAddHabitModalOpen: (open: boolean) => set({ isAddHabitModalOpen: open }),
}))

