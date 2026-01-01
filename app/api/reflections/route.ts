import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import MonthlyReflection from '@/models/MonthlyReflection'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '0')
    const month = parseInt(searchParams.get('month') || '0')

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      )
    }

    const reflection = await MonthlyReflection.findOne({
      userId: session.user.id,
      year,
      month,
    }).lean()

    return NextResponse.json(reflection || { content: '' })
  } catch (error) {
    console.error('Error fetching reflection:', error)
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

    const { year, month, content } = await request.json()

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      )
    }

    const reflection = await MonthlyReflection.findOneAndUpdate(
      {
        userId: session.user.id,
        year,
        month,
      },
      {
        userId: session.user.id,
        year,
        month,
        content: content || '',
      },
      {
        upsert: true,
        new: true,
      }
    )

    return NextResponse.json({
      ...reflection.toObject(),
      id: reflection._id.toString(),
    })
  } catch (error) {
    console.error('Error saving reflection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
