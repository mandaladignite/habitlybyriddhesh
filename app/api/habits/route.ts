import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
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
    const archived = searchParams.get('archived') === 'true'
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const query: any = {
      userId: session.user.id,
      archived: archived || false,
    }

    const habits = await Habit.find(query).sort({ createdAt: -1 }).lean()

    // If month/year specified, fetch entries for that period
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      endDate.setHours(23, 59, 59, 999)

      const entries = await HabitEntry.find({
        userId: session.user.id,
        date: { $gte: startDate, $lte: endDate },
      }).lean()

      const habitsWithEntries = habits.map((habit) => ({
        ...habit,
        id: habit._id.toString(),
        entries: entries
          .filter((e: any) => e.habitId.toString() === habit._id.toString())
          .map((e: any) => ({
            date: e.date,
            completed: e.completed,
          })),
      }))

      return NextResponse.json(habitsWithEntries)
    }

    const habitsWithIds = habits.map((habit) => ({
      ...habit,
      id: habit._id.toString(),
      entries: [],
    }))

    return NextResponse.json(habitsWithIds)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { name, emoji, color, frequency, targetTime, weeklyTarget, monthlyTarget } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Habit name is required' },
        { status: 400 }
      )
    }

    const habit = await Habit.create({
      name,
      emoji: emoji || '✨',
      color,
      frequency: frequency || 'daily',
      targetTime,
      weeklyTarget: weeklyTarget || 7,
      monthlyTarget: monthlyTarget || 30,
      userId: session.user.id,
    })

    return NextResponse.json({
      ...habit.toObject(),
      id: habit._id.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get('id')

    if (!habitId) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
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

    await Habit.deleteOne({ _id: habitId })
    await HabitEntry.deleteMany({ habitId })

    return NextResponse.json({ message: 'Habit deleted' })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
