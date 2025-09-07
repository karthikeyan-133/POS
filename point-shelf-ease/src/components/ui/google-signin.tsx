import { useEffect, useRef } from 'react';
import { Button } from './button';

interface GoogleSignInProps {
  onSuccess: (credential: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
  text?: string;
}

// Declare global google object for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleSignIn = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  text = "Continue with Google"
}: GoogleSignInProps) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isGoogleLoaded = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google || isGoogleLoaded.current) {
        initializeGoogle();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        isGoogleLoaded.current = true;
        initializeGoogle();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        onError(new Error('Failed to load Google authentication'));
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: '100%',
            logo_alignment: 'left',
          }
        );
      } catch (error) {
        console.error('Google Sign-In initialization error:', error);
        onError(error);
      }
    };

    const handleCredentialResponse = (response: any) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError(new Error('No credential received from Google'));
      }
    };

    if (!disabled) {
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured');
        return;
      }
      loadGoogleScript();
    }

    return () => {
      // Cleanup if needed
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
    };
  }, [onSuccess, onError, disabled]);

  // Fallback UI when Google script is loading or failed
  const renderFallbackButton = () => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors relative"
      disabled={disabled}
      onClick={() => {
        onError(new Error('Google Sign-In not available'));
      }}
    >
      <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {text}
    </Button>
  );

  return (
    <div className="w-full">
      <div
        ref={googleButtonRef}
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
        style={{ minHeight: '44px' }}
      />
      {/* Show fallback if Google button doesn't render */}
      <noscript>{renderFallbackButton()}</noscript>
    </div>
  );
};

export default GoogleSignIn;