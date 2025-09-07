import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup'); // Start with signup tab
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' // Default to admin for first user
  });
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    
    if (!formData.password) {
      toast.error('Please enter your password.');
      return;
    }
    
    setIsLoading(true);
    
    const result = await signIn(formData.email, formData.password);
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    
    if (!formData.password) {
      toast.error('Please enter a password.');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    
    const result = await signUp(formData.email, formData.password, formData.fullName, formData.role);
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-vibrant-blue/5 via-vibrant-purple/5 to-vibrant-pink/5"></div>
      
      <Card className="relative w-full max-w-md bg-white border-border shadow-2xl hover:shadow-xl transition-all duration-300">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="bg-gradient-primary rounded-2xl p-4 shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground bg-gradient-hero bg-clip-text text-transparent">Point Shelf Ease</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">Professional Point of Sale System</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-lg border border-border">
              <TabsTrigger 
                value="signup" 
                className="text-foreground data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all duration-300"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="signin" 
                className="text-foreground data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all duration-300"
              >
                Sign In
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6 mt-6">
              <div className="text-center mb-4">
                <p className="text-muted-foreground">
                  Sign in to your Point Shelf Ease account
                </p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="text-center pt-4">
                <p className="text-muted-foreground">
                  Don't have an account? 
                  <span 
                    className="text-vibrant-blue font-medium cursor-pointer hover:text-vibrant-purple transition-colors duration-300" 
                    onClick={() => setActiveTab('signup')}
                  >
                    Create one now
                  </span>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground">
                  Create your account to get started with Point Shelf Ease
                </p>
              </div>
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground font-medium">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      <SelectItem value="admin" className="hover:bg-vibrant-blue/10">Admin</SelectItem>
                      <SelectItem value="manager" className="hover:bg-vibrant-blue/10">Manager</SelectItem>
                      <SelectItem value="cashier" className="hover:bg-vibrant-blue/10">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      className="h-11 border-vibrant-blue/30 focus:border-vibrant-blue focus:ring-2 focus:ring-vibrant-blue/20"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
              
              <div className="text-center pt-4">
                <p className="text-muted-foreground">
                  Already have an account? 
                  <span 
                    className="text-vibrant-blue font-medium cursor-pointer hover:text-vibrant-purple transition-colors duration-300" 
                    onClick={() => setActiveTab('signin')}
                  >
                    Sign in here
                  </span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;