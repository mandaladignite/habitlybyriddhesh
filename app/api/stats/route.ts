import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Habit from '@/models/Habit'
import HabitEntry from '@/models/HabitEntry'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    endDate.setHours(23, 59, 59, 999)

    const habits = await Habit.find({
      userId: session.user.id,
      archived: false,
    }).lean()

    const entries = await HabitEntry.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    const totalHabits = habits.length
    const totalEntries = entries.length
    const completedEntries = entries.filter((e: any) => e.completed).length
    const completionPercentage =
      totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0

    // Calculate current streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let currentStreak = 0
    let checkDate = new Date(today)

    while (true) {
      const dayEntries = await HabitEntry.find({
        userId: session.user.id,
        date: checkDate,
        completed: true,
      }).lean()

      if (dayEntries.length === 0) break

      const habitIds = new Set(dayEntries.map((e: any) => e.habitId.toString()))
      const allHabitsCompleted = habits.every((habit: any) =>
        habitIds.has(habit._id.toString())
      )

      if (!allHabitsCompleted && checkDate < today) break

      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Find best habit (highest completion rate)
    const habitStats = habits.map((habit: any) => {
      const habitEntries = entries.filter(
        (e: any) => e.habitId.toString() === habit._id.toString()
      )
      const completed = habitEntries.filter((e: any) => e.completed).length
      const total = habitEntries.length
      return {
        habit,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      }
    })

    const bestHabit = habitStats.reduce(
      (best: any, current: any) =>
        current.completionRate > best.completionRate ? current : best,
      habitStats[0] || { habit: null, completionRate: 0 }
    )

    return NextResponse.json({
      totalHabits,
      currentStreak,
      completionPercentage,
      bestHabit: bestHabit.habit
        ? {
            name: bestHabit.habit.name,
            emoji: bestHabit.habit.emoji,
            completionRate: Math.round(bestHabit.completionRate),
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
