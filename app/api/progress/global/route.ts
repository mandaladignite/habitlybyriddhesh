import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Habit from '@/models/Habit'
import HabitEntry from '@/models/HabitEntry'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get user's active habits
    const habits = await Habit.find({ 
      userId: session.user.id, 
      archived: false 
    })

    const totalHabits = habits.length

    // Calculate targets
    const weeklyTarget = habits.reduce((sum, habit) => sum + (habit.weeklyTarget || 7), 0)
    const monthlyTarget = habits.reduce((sum, habit) => sum + (habit.monthlyTarget || 30), 0)

    // Get completion counts for different periods
    const [completedToday, completedThisWeek, completedThisMonth] = await Promise.all([
      // Today's completions
      HabitEntry.countDocuments({
        userId: session.user.id,
        date: { $gte: todayStart, $lte: todayEnd },
        completed: true
      }),
      
      // This week's completions
      HabitEntry.countDocuments({
        userId: session.user.id,
        date: { $gte: weekStart, $lte: weekEnd },
        completed: true
      }),
      
      // This month's completions
      HabitEntry.countDocuments({
        userId: session.user.id,
        date: { $gte: monthStart, $lte: monthEnd },
        completed: true
      })
    ])

    // Calculate percentages
    const weeklyPercentage = weeklyTarget > 0 ? Math.round((completedThisWeek / weeklyTarget) * 100) : 0
    const monthlyPercentage = monthlyTarget > 0 ? Math.round((completedThisMonth / monthlyTarget) * 100) : 0

    // Get top performing habits for this month
    const habitEntries = await HabitEntry.find({
      userId: session.user.id,
      date: { $gte: monthStart, $lte: monthEnd },
      completed: true
    })

    // Calculate completion stats for each habit
    const habitStats = habits.map(habit => {
      const habitCompletions = habitEntries.filter(entry => 
        entry.habitId === habit._id.toString()
      ).length
      
      const habitTarget = habit.monthlyTarget || 30
      const percentage = habitTarget > 0 ? Math.round((habitCompletions / habitTarget) * 100) : 0
      
      return {
        name: habit.name,
        emoji: habit.emoji,
        completed: habitCompletions,
        total: habitTarget,
        percentage
      }
    })

    // Sort by completion percentage and get top habits
    const topHabits = habitStats
      .sort((a, b) => b.percentage - a.percentage)
      .filter(habit => habit.completed > 0) // Only include habits with some completions

    return NextResponse.json({
      totalHabits,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      weeklyTarget,
      monthlyTarget,
      weeklyPercentage,
      monthlyPercentage,
      topHabits
    })

  } catch (error) {
    console.error('Error fetching global progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
