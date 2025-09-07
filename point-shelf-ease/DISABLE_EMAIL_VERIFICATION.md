# Disable Email Verification in Supabase

To avoid email verification for your QuickPOS application, you need to configure your Supabase project settings.

## Method 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Access Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "Settings" tab

3. **Disable Email Confirmation**
   - Find "Email Confirmation" setting
   - Set it to **"Disabled"**
   - Save the changes

## Method 2: SQL Command (Alternative)

If you have access to the SQL editor in Supabase:

```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET email_confirm_required = false;

-- Optional: Auto-confirm existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email_confirmed_at IS NULL;
```

## Method 3: Environment Variable (For local development)

Add to your `.env` file:

```env
# Disable email confirmation for development
SUPABASE_AUTH_EMAIL_CONFIRM = false
```

## Verification

After making these changes:

1. Try creating a new account
2. You should be able to sign in immediately without email verification
3. The success message should indicate no email verification is required

## Security Note

⚠️ **Important**: Disabling email verification reduces security as it allows users to sign up with any email address without proving ownership. Consider this trade-off for your use case.

For production applications, consider implementing alternative verification methods if needed.