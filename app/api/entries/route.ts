import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Habit from '@/models/Habit'
import HabitEntry from '@/models/HabitEntry'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { habitId, date, completed, notes, value } = await request.json()

    if (!habitId || !date) {
      return NextResponse.json(
        { error: 'Habit ID and date are required' },
        { status: 400 }
      )
    }

    const habit = await Habit.findOne({
      _id: habitId,
      userId: session.user.id,
    })

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    const entryDate = new Date(date)
    entryDate.setHours(0, 0, 0, 0)

    const entry = await HabitEntry.findOneAndUpdate(
      {
        habitId,
        userId: session.user.id,
        date: entryDate,
      },
      {
        habitId,
        userId: session.user.id,
        date: entryDate,
        completed: completed ?? true,
        notes,
        value,
      },
      {
        upsert: true,
        new: true,
      }
    )

    return NextResponse.json({
      ...entry.toObject(),
      id: entry._id.toString(),
    })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
