# Cloudflare Deployment

## Quick Deploy

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Configure Environment Variables**
   Edit `wrangler.toml` and add your Supabase credentials:
   ```toml
   [env.production.vars]
   SUPABASE_URL = "https://your-project.supabase.co"
   SUPABASE_ANON_KEY = "your-anon-key"
   JWT_SECRET = "your-secret-key"
   ```

4. **Deploy Backend**
   ```bash
   npm install
   cd workers && npm install && cd ..
   npm run deploy:worker
   ```

5. **Deploy Frontend**
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Connect your Git repository
   - Build command: `npm run build`
   - Build output: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your worker URL
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase key

Done! Your production-ready POS system is now live on Cloudflare's global network.