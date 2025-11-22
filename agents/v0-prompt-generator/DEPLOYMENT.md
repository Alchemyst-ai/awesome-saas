# Deployment Guide

## Vercel Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Alchemyst AI API Key**: Obtain from [Alchemyst AI Dashboard](https://platform.getalchemystai.com/dashboard)
3. **GitHub Repository**: Code should be pushed to a GitHub repository

### Environment Variables Setup

Before deploying, configure the following environment variables in your Vercel dashboard:

#### Required Variables

- `ALCHEMYST_API_KEY`: Your Alchemyst AI API key
- `ALCHEMYST_BASE_URL`: https://platform.getalchemystai.com/getstarted

#### Optional Variables

- `NEXT_PUBLIC_APP_NAME`: V0 Prompt Generator (default)
- `NEXT_PUBLIC_APP_VERSION`: 1.0.0 (default)
- `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING`: false (default)

### Deployment Steps

1. **Connect Repository**

   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Next.js project

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the required variables listed above

4. **Deploy**
   - Click "Deploy" - Vercel will build and deploy automatically
   - Your app will be available at `https://your-project-name.vercel.app`

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring and Analytics

- **Build Logs**: Available in Vercel dashboard under "Functions" tab
- **Performance**: Monitor Core Web Vitals in Vercel Analytics
- **Errors**: Check runtime logs in the "Functions" tab

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation locally

2. **Environment Variable Issues**
   - Ensure ALCHEMYST_API_KEY is set correctly
   - Check variable names match exactly (case-sensitive)
   - Redeploy after adding new environment variables

3. **API Timeout Issues**
   - Vercel functions have a 10s timeout on Hobby plan
   - Consider upgrading to Pro plan for 60s timeout
   - Optimize AI requests for faster response times

#### Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Alchemyst AI Support: [support.getalchemystai.com](https://platform.getalchemystai.com/getstarted)
