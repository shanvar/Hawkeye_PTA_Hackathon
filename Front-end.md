# StartupAI Incubator - Complete Setup Guide

## Overview
This is a fully functional AI-powered startup incubator platform built with Next.js, Gemini AI, and modern web technologies. All features are connected to real APIs and ready for deployment.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Google Generative AI API key
- Vercel account (for deployment)

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key
4. Keep it safe - you'll need it in the next step

## Step 2: Local Development Setup

### Clone or Download the Project
\`\`\`bash
# If using git
git clone <your-repo-url>
cd startup-incubator

# Or download and extract the ZIP file
\`\`\`

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

Replace `your_api_key_here` with your actual Gemini API key.

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` in your browser.

## Step 3: Features Overview

### AI Advisor (`/advisor`)
- Real-time chat with Gemini AI
- Get personalized startup guidance
- Ask about business planning, market analysis, marketing strategies
- Streaming responses for better UX

### Document Generator (`/documents`)
- Generate business plans
- Create pitch deck outlines
- Write executive summaries
- Build financial models
- All powered by Gemini AI

### Startup Ideas (`/ideas`)
- Browse community startup ideas
- Vote and comment on ideas
- Submit your own ideas
- Filter by category

### Mentors (`/mentors`)
- Find experienced mentors
- Book mentorship sessions
- Filter by expertise
- View mentor profiles and ratings

### Co-Founders (`/co-founders`)
- Find potential co-founders
- View compatibility scores
- Connect with like-minded founders

### Analytics (`/analytics`)
- Track your startup progress
- View engagement metrics
- Monitor idea performance

## Step 4: API Endpoints

All API endpoints are fully functional and connected to Gemini AI:

### Chat & Advisor
- `POST /api/advisor` - Stream-based chat with AI advisor
- `POST /api/chat` - Standard chat endpoint

### Document Generation
- `POST /api/generate-document` - Generate business documents
- `POST /api/generate-business-plan` - Specific business plan generation

### Analysis & Validation
- `POST /api/analyze-idea` - Analyze startup ideas
- `POST /api/idea-validation` - Validate idea viability
- `POST /api/pitch-feedback` - Get feedback on pitches

### Matching & Booking
- `POST /api/cofounder-match` - Find compatible co-founders
- `POST /api/mentor-availability` - Check mentor availability and create plans

## Step 5: Deployment to Vercel

### Option 1: Using Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

### Option 2: Using GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variables:
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Your Gemini API key
6. Click "Deploy"

### Option 3: Manual Deployment

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Upload your project files
4. Configure environment variables
5. Deploy

## Step 6: Configure Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

\`\`\`
GOOGLE_GENERATIVE_AI_API_KEY = your_api_key_here
\`\`\`

4. Redeploy your project

## Step 7: Testing the Application

### Test AI Advisor
1. Go to `/advisor`
2. Click on a suggested prompt or type your own
3. Verify you get AI responses

### Test Document Generator
1. Go to `/documents`
2. Select a template
3. Fill in the form
4. Click "Generate Document"
5. Download the generated content

### Test Idea Analysis
1. Go to `/ideas`
2. Click on an idea
3. The analysis should load from the API

### Test Mentor Booking
1. Go to `/mentors`
2. Click "Book Session" on any mentor
3. Fill in the booking form
4. Submit to test the API

## Troubleshooting

### "API key not found" Error
- Check that `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- Verify the API key is correct
- Restart the development server

### "Failed to generate document" Error
- Ensure your Gemini API key has quota remaining
- Check that the API key has access to the generative AI models
- Try again in a few moments

### Streaming not working in Advisor
- Check browser console for errors
- Verify the `/api/advisor` endpoint is responding
- Ensure you're using a modern browser with fetch API support

### Deployment Issues
- Check Vercel build logs for errors
- Verify all environment variables are set
- Ensure Node.js version is 18+

## Project Structure

\`\`\`
startup-incubator/
├── app/
│   ├── api/                    # API routes
│   │   ├── advisor/           # AI advisor endpoint
│   │   ├── analyze-idea/      # Idea analysis
│   │   ├── chat/              # Chat endpoint
│   │   ├── cofounder-match/   # Co-founder matching
│   │   ├── generate-document/ # Document generation
│   │   ├── idea-validation/   # Idea validation
│   │   ├── mentor-availability/ # Mentor booking
│   │   └── pitch-feedback/    # Pitch feedback
│   ├── advisor/               # AI advisor page
│   ├── analytics/             # Analytics page
│   ├── co-founders/           # Co-founders page
│   ├── documents/             # Document generator
│   ├── ideas/                 # Ideas page
│   ├── mentors/               # Mentors page
│   ├── profile/               # User profile
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # UI components
│   ├── header.tsx             # Header component
│   ├── footer.tsx             # Footer component
│   └── ...                    # Other components
├── lib/
│   ├── gemini.ts              # Gemini AI setup
│   ├── types.ts               # TypeScript types
│   └── prompts.ts             # AI prompts
└── public/                    # Static assets
\`\`\`

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **AI**: Google Generative AI (Gemini)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Styling**: CSS-in-JS with design tokens
- **Deployment**: Vercel

## Performance Optimization

- Server-side rendering for better SEO
- Streaming responses for AI features
- Image optimization with Next.js Image
- CSS optimization with Tailwind
- API route caching where appropriate

## Security Best Practices

- API keys stored in environment variables
- No sensitive data in client-side code
- CORS headers configured properly
- Input validation on all API endpoints
- Rate limiting recommended for production

## Next Steps

1. Customize the branding and colors
2. Add user authentication (Supabase recommended)
3. Implement database for persistent storage
4. Add payment processing for premium features
5. Set up email notifications
6. Add analytics tracking
7. Implement user profiles and authentication

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Generative AI Docs](https://ai.google.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## License

This project is open source and available under the MIT License.

---

**Ready to launch your startup incubator? Deploy to Vercel now!**
