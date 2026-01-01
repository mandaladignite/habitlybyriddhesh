import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Habit from '@/models/Habit'
import HabitEntry from '@/models/HabitEntry'
import WeeklyProgress from '@/models/WeeklyProgress'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const weekStart = searchParams.get('weekStart')
    
    let targetWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    if (weekStart) {
      targetWeekStart = new Date(weekStart)
    }

    const weekEnd = endOfWeek(targetWeekStart, { weekStartsOn: 1 })

    // Get user's habits
    const habits = await Habit.find({ 
      userId: session.user.id, 
      archived: false 
    })

    // Calculate weekly progress for each habit
    const weeklyProgressData = []

    for (const habit of habits) {
      // Get completed entries for this week
      const completedEntries = await HabitEntry.countDocuments({
        habitId: habit._id.toString(),
        userId: session.user.id,
        date: { $gte: targetWeekStart, $lte: weekEnd },
        completed: true
      })

      const target = habit.weeklyTarget || 7
      const percentage = target > 0 ? Math.round((completedEntries / target) * 100) : 0

      // Update or create weekly progress record
      await WeeklyProgress.findOneAndUpdate(
        {
          userId: session.user.id,
          habitId: habit._id.toString(),
          weekStart: targetWeekStart
        },
        {
          completed: completedEntries,
          target,
          percentage
        },
        { upsert: true, new: true }
      )

      weeklyProgressData.push({
        habitId: habit._id,
        habitName: habit.name,
        habitEmoji: habit.emoji,
        completed: completedEntries,
        target,
        percentage,
        ratio: `${completedEntries}/${target}`
      })
    }

    return NextResponse.json({
      weekStart: targetWeekStart,
      weekEnd,
      data: weeklyProgressData
    })

  } catch (error) {
    console.error('Error fetching weekly progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
