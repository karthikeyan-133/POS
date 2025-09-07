import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="text-center rounded-2xl p-8 bg-white border-2 border-border shadow-xl max-w-md w-full">
        <div className="bg-gradient-primary rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">404</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-foreground bg-gradient-hero bg-clip-text text-transparent">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="gap-2 bg-gradient-primary hover:opacity-90 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Home className="h-5 w-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;