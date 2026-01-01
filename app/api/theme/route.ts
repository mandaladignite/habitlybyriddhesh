import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import ThemePreference from '@/models/ThemePreference'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const preference = await ThemePreference.findOne({
      userId: session.user.id,
    }).lean()

    return NextResponse.json({
      theme: preference?.theme || 'discipline',
    })
  } catch (error) {
    console.error('Error fetching theme:', error)
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

    const { theme } = await request.json()

    if (!['discipline', 'struggle', 'performance', 'warrior'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      )
    }

    const preference = await ThemePreference.findOneAndUpdate(
      { userId: session.user.id },
      { userId: session.user.id, theme },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      ...preference.toObject(),
      id: preference._id.toString(),
    })
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
