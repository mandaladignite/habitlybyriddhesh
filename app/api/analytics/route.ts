import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import HabitEntry from '@/models/HabitEntry'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

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

    const startDate = startOfMonth(new Date(year, month - 1, 1))
    const endDate = endOfMonth(new Date(year, month - 1, 1))

    const entries = await HabitEntry.find({
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).lean()

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    const dailyData = days.map((day) => {
      const dayEntries = entries.filter((e: any) => {
        const entryDate = new Date(e.date)
        return (
          entryDate.getDate() === day.getDate() &&
          entryDate.getMonth() === day.getMonth() &&
          entryDate.getFullYear() === day.getFullYear()
        )
      })
      
      const completed = dayEntries.filter((e: any) => e.completed).length
      const total = dayEntries.length

      return {
        date: format(day, 'yyyy-MM-dd'),
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    })

    // Weekly breakdown
    const weeks: Array<{ week: number; completed: number; total: number; percentage: number }> = []
    for (let week = 0; week < 5; week++) {
      const weekStart = week * 7
      const weekEnd = Math.min(weekStart + 6, dailyData.length - 1)
      if (weekStart >= dailyData.length) break

      const weekData = dailyData.slice(weekStart, weekEnd + 1)
      const completed = weekData.reduce((sum, day) => sum + day.completed, 0)
      const total = weekData.reduce((sum, day) => sum + day.total, 0)

      weeks.push({
        week: week + 1,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }

    return NextResponse.json({
      daily: dailyData,
      weekly: weeks,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


