# Quick Setup Guide

Follow these steps to get Habitly running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI="mongodb://localhost:27017/habit-tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Note:** Google OAuth is optional. You can leave those fields empty if you only want email/password authentication.

## 3. Start Development Server
```bash
npm run dev
```

## 4. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Create an Account**
   - Click "Start Free" on the landing page
   - Register with email/password (or use Google if configured)
   - You'll be redirected to the dashboard

2. **Add Your First Habit**
   - Go to the Tracker page
   - Click "Add Habit"
   - Enter a name and choose an emoji
   - Start tracking!

3. **Track Daily**
   - Click on any day cell to mark a habit as completed
   - View your progress and streaks

## Troubleshooting

### Database Issues
- Make sure `MONGODB_URI` is set correctly in your `.env`
- Ensure your MongoDB instance (local or Atlas) is running and accessible

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your local URL
- For Google OAuth, make sure redirect URIs are configured in Google Console

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Run `npm run db:generate`

## Next Steps

- Customize themes in `tailwind.config.ts`
- Add more features in the components
- Deploy to Vercel for production

For more details, see [README.md](./README.md)

