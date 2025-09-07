import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Validate input
      if (!email || !password) {
        toast.error('Please enter both email and password.');
        return { error: new Error('Email and password are required') };
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return { error: new Error('Invalid email format') };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password')) {
          // Check if this might be a new user
          const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);
            
          if (!profileError && profiles && profiles.length === 0) {
            toast.error('No accounts found. Please create your first account using the Sign Up tab.');
          } else {
            toast.error('Invalid email or password. Please check your credentials or create a new account.');
          }
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Your account exists but may need activation. Try signing in again or contact support.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else if (error.message.includes('User not found')) {
          toast.error('No account found with this email. Please sign up first.');
        } else {
          toast.error(error.message || 'Sign-in failed. Please try again.');
        }
        return { error };
      } else {
        toast.success('Welcome back!');
        return { error: null };
      }
    } catch (err) {
      toast.error('Connection failed. Please check your internet connection and try again.');
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role = 'admin') => {
    try {
      // Validate input
      if (!email || !password || !fullName) {
        toast.error('Please fill in all required fields.');
        return { error: new Error('All fields are required') };
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return { error: new Error('Invalid email format') };
      }
      
      // Check password strength
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return { error: new Error('Password too short') };
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
            role: role
          }
        }
      });
      
      if (error) {
        // Provide more specific error messages
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be')) {
          toast.error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Unable to validate email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message.includes('Signup is disabled')) {
          toast.error('New account registration is currently disabled. Please contact your administrator.');
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        return { error };
      } else {
        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast.success('Account created! You can now sign in immediately - no email verification required.');
        } else {
          toast.success('Account created successfully! Welcome to QuickPOS!');
        }
        return { error: null };
      }
    } catch (err) {
      toast.error('Connection failed. Please check your internet connection and try again.');
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};