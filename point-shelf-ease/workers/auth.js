// Auth handlers for Cloudflare Workers
import { Router } from 'itty-router';
import { createSupabaseClient } from './supabase-client';

const authRouter = Router({ base: '/api/auth' });

// Helper function to hash passwords (using Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to verify JWT token
async function verifyToken(token, secret) {
  try {
    // Simple JWT verification for demo - in production use proper JWT library
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Helper function to create JWT token
async function createToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  
  // Simple signature for demo - use proper HMAC in production
  const signature = await hashPassword(`${encodedHeader}.${encodedPayload}.${secret}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Register new user
authRouter.post('/register', async (request) => {
  try {
    const { email, password, fullName, role = 'cashier' } = await request.json();
    
    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({
        error: 'Email, password, and full name are required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const supabase = createSupabaseClient(request.env);
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return new Response(JSON.stringify({
        error: 'User already exists with this email'
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Generate token
    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    }, request.env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role
      },
      token
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to create user',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Login user
authRouter.post('/login', async (request) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({
        error: 'Email and password are required'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const supabase = createSupabaseClient(request.env);
    
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return new Response(JSON.stringify({
        error: 'Invalid email or password'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!user.is_active) {
      return new Response(JSON.stringify({
        error: 'Account is deactivated'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({
        error: 'Invalid email or password'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Generate token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role
    }, request.env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      token
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Login failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Get current user profile
authRouter.get('/profile', async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return new Response(JSON.stringify({
        error: 'Access token required'
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    const decoded = await verifyToken(token, request.env.JWT_SECRET);
    const supabase = createSupabaseClient(request.env);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return new Response(JSON.stringify({
        error: 'User not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch user profile',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Logout
authRouter.post('/logout', () => {
  return new Response(JSON.stringify({
    message: 'Logout successful'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

export async function handleAuth(request) {
  return authRouter.handle(request);
}