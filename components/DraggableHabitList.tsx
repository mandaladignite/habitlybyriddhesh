'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit, Trash2, GripVertical } from 'lucide-react'

interface Habit {
  id: string
  name: string
  emoji: string
  targetTime?: string
  weeklyTarget?: number
  monthlyTarget?: number
  entries: { date: Date; completed: boolean }[]
}

interface DraggableHabitListProps {
  habits: Habit[]
  selectedMonth: Date
  onToggleEntry: (habitId: string, date: Date) => void
  onDeleteHabit: (habitId: string) => void
  onEditHabit: (habit: Habit) => void
  onReorder: (habits: Habit[]) => void
  togglingEntry?: string | null
}

export function DraggableHabitList({ 
  habits, 
  selectedMonth, 
  onToggleEntry, 
  onDeleteHabit, 
  onEditHabit, 
  onReorder,
  togglingEntry 
}: DraggableHabitListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active && over) {
      const oldIndex = habits.findIndex(habit => habit.id === active.id)
      const newIndex = habits.findIndex(habit => habit.id === over.id)

      if (oldIndex !== newIndex) {
        const reorderedHabits = arrayMove(habits, oldIndex, newIndex)
        onReorder(reorderedHabits)
      }
    }

    setActiveId(null)
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <SortableContext items={habits} strategy={verticalListSortingStrategy}>
          {habits.map((habit) => (
            <SortableItem
              key={habit.id}
              id={habit.id}
              habit={habit}
              selectedMonth={selectedMonth}
              onToggleEntry={onToggleEntry}
              onDeleteHabit={onDeleteHabit}
              onEditHabit={onEditHabit}
              togglingEntry={togglingEntry}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface SortableItemProps {
  id: string
  habit: Habit
  selectedMonth: Date
  onToggleEntry: (habitId: string, date: Date) => void
  onDeleteHabit: (habitId: string) => void
  onEditHabit: (habit: Habit) => void
  togglingEntry?: string | null
}

function SortableItem({ 
  id, 
  habit, 
  selectedMonth, 
  onToggleEntry, 
  onDeleteHabit, 
  onEditHabit,
  togglingEntry 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-card rounded-lg border border-border p-4 shadow-sm"
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab"
        >
          <GripVertical size={16} className="text-muted-foreground" />
        </div>

        {/* Habit content */}
        <div className="pl-8 pr-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{habit.emoji}</span>
              <div>
                <div className="font-semibold text-foreground">{habit.name}</div>
                {habit.targetTime && (
                  <div className="text-sm text-muted-foreground">{habit.targetTime}</div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditHabit(habit)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Edit habit"
              >
                <Edit size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete habit"
              >
                <Trash2 size={16} className="text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
