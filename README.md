# Habitly - Aesthetic Habit Tracker

An aesthetic, viral-ready habit tracker built with Next.js 14, inspired by Excel habit trackers but enhanced with modern UX, animations, analytics, and sharing capabilities.

## Features

- 📅 **Monthly Habit Grid** - Visual Excel-inspired tracker for the whole month
- 🔥 **Smart Streaks** - Automatic streak calculation and tracking
- 🎨 **Performance Themes** - Choose from Discipline, Struggle, Performance, or Warrior themes
- 📊 **Performance Charts** - Visual analytics with daily trends and weekly summaries
- 📈 **Detailed Analytics** - Track completion percentages, streaks, and best habits
- 💭 **Monthly Reflections** - Reflect on what worked and what to improve
- 📤 **Export & Share** - Export your tracker as a beautiful PNG image
- 🔐 **Authentication** - Secure login with Google OAuth or email/password
- 📱 **Fully Responsive** - Mobile-first design optimized for all screen sizes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js (Auth.js)
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Recharts for performance visualization
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Export**: html-to-image

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Project Tracker"
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up MongoDB**
   
   - **Option 1: Local MongoDB**
     - Install MongoDB locally
     - Start MongoDB service
   
   - **Option 2: MongoDB Atlas (Cloud)**
     - Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a cluster
     - Get your connection string

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI="mongodb://localhost:27017/habit-tracker"
   # Or use MongoDB Atlas:
   # MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Google OAuth (optional, for Google sign-in)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── tracker/           # Habit tracker page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations (including MongoDB)
├── models/                # Mongoose models
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Usage

### Creating an Account

1. Click "Start Free" on the landing page
2. Sign up with Google or create an account with email/password
3. You'll be redirected to the dashboard

### Adding Habits

1. Navigate to the Tracker page
2. Click "Add Habit"
3. Enter a habit name and choose an emoji
4. Click "Add Habit"

### Tracking Habits

1. On the Tracker page, click any day cell to mark a habit as completed
2. Click again to unmark
3. Today's column is highlighted
4. View your completion percentage for each habit

### Monthly Reflection

1. Scroll to the bottom of the Tracker page
2. Write your reflection in the text area
3. It saves automatically

### Exporting Your Tracker

1. On the Tracker page, click the "Export" button
2. Your tracker will be downloaded as a PNG image
3. Share it on social media!

### Changing Themes

1. Go to Settings or use the theme switcher on the Tracker page
2. Select your preferred theme
3. Your preference is saved automatically

## Database Schema (MongoDB)

- **User** - User accounts and authentication
- **Habit** - User habits with emoji and metadata
- **HabitEntry** - Daily habit completion records with optional notes and values
- **MonthlyReflection** - Monthly reflection notes
- **ThemePreference** - User theme preferences (discipline, struggle, performance, warrior)

Collections are automatically created on first use.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Add environment variables in Vercel dashboard for MongoDB & Auth
5. Deploy!

### Environment Variables for Production

Make sure to set:
- `MONGODB_URI` - MongoDB connection string (Atlas recommended)
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - A secure random string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Development

### Database

MongoDB collections are automatically created when you first use the application. You can use MongoDB Compass or MongoDB Atlas UI to view your data.

### Building for Production

```bash
npm run build
npm start
```

## Design System

### Colors (Discipline Theme - Default)

- Background: `#0A0E1A` (Dark navy)
- Card: `#141B2D` (Darker navy)
- Primary: `#3B82F6` (Blue - Discipline)
- Secondary: `#10B981` (Green - Performance)
- Accent: `#F59E0B` (Amber - Struggle)
- Text: `#F8FAFC` (Light)
- Muted: `#94A3B8` (Gray)

**Available Themes:**
- **Discipline** - Dark blue/green (consistency)
- **Struggle** - Red/orange (effort & challenges)
- **Performance** - Green/blue (achievement)
- **Warrior** - Purple/pink (strength)

### Typography

- Headings: Poppins (600-700 weight)
- Body: Inter (400-500 weight)
- Accent: Playfair Display (for subtitles)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for better habits.

# habitly
# habitly
# habitly
# habitly
# habitlybyriddhesh
