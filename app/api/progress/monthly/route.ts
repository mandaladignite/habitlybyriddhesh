import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Habit from '@/models/Habit'
import HabitEntry from '@/models/HabitEntry'
import MonthlyOverview from '@/models/MonthlyOverview'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    
    const now = new Date()
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1 // 1-12

    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(new Date(year, month - 1))

    // Get user's habits
    const habits = await Habit.find({ 
      userId: session.user.id, 
      archived: false 
    })

    // Calculate total target for the month
    const totalTarget = habits.reduce((sum, habit) => sum + (habit.monthlyTarget || 30), 0)

    // Get all completed entries for this month
    const completedEntries = await HabitEntry.countDocuments({
      userId: session.user.id,
      date: { $gte: monthStart, $lte: monthEnd },
      completed: true
    })

    const left = Math.max(0, totalTarget - completedEntries)
    const percentage = totalTarget > 0 ? Math.round((completedEntries / totalTarget) * 100) : 0

    // Update or create monthly overview record
    await MonthlyOverview.findOneAndUpdate(
      {
        userId: session.user.id,
        year,
        month
      },
      {
        completed: completedEntries,
        target: totalTarget,
        left,
        percentage
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      year,
      month,
      monthStart,
      monthEnd,
      completed: completedEntries,
      target: totalTarget,
      left,
      percentage,
      monthName: format(monthStart, 'MMMM')
    })

  } catch (error) {
    console.error('Error fetching monthly overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
