import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../utils/api.js';

let globalGsiInitialized = false;

/**
 * useGoogleAuth — Shared hook for Google Identity Services (GSI)
 * Supports Google One Tap and Google Sign-In button rendering.
 */
export function useGoogleAuth({ onNavigate, autoPrompt = false, currentPath = '/' } = {}) {
  const { user, loginWithGoogleCredential } = useAuth();
  const toast = useToast();
  const [clientId, setClientId] = useState(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [isReady, setIsReady] = useState(false);
  const [isNativePromptShowing, setIsNativePromptShowing] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Fetch client ID from backend if not defined in Vite env
  useEffect(() => {
    if (!clientId) {
      api.auth
        .getGoogleClientId()
        .then((res) => {
          if (res?.clientId) setClientId(res.clientId);
        })
        .catch((err) => console.warn('[useGoogleAuth] Could not fetch Google Client ID', err));
    }
  }, [clientId]);

  // Handle credential response from Google Identity Services
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        toast.error('Google sign-in did not return a valid credential.');
        return;
      }

      setIsAuthenticating(true);
      try {
        const res = await loginWithGoogleCredential(response.credential);
        toast.success(`Welcome to CodeTyper, ${res.user.full_name || res.user.username}!`);
        if (onNavigate) {
          onNavigate('dashboard');
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error('[Google Login Error]', err);
        toast.error(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setIsAuthenticating(false);
      }
    },
    [loginWithGoogleCredential, onNavigate, toast]
  );

  // Initialize Google Identity Services ONCE globally
  useEffect(() => {
    if (!clientId || user) return;

    let checkInterval = null;
    let attempts = 0;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        if (!globalGsiInitialized) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: false
            });
            globalGsiInitialized = true;
          } catch (e) {
            console.warn('[GSI Init Error]', e);
          }
        }
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (!initGsi()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (initGsi() || attempts > 25) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, user, handleCredentialResponse]);

  // Prompt Google One Tap on mount and on every page navigation for logged-out users
  useEffect(() => {
    if (!autoPrompt || !clientId || user || !isReady) return;

    const timer = setTimeout(() => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.prompt((notification) => {
            if (notification.isDisplayed()) {
              setIsNativePromptShowing(true);
            } else if (notification.isNotDisplayed()) {
              setIsNativePromptShowing(false);
              console.log(`[GSI One Tap not displayed on ${currentPath}]`, notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              setIsNativePromptShowing(false);
              console.log(`[GSI One Tap skipped on ${currentPath}]`, notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
              setIsNativePromptShowing(false);
              console.log(`[GSI One Tap dismissed on ${currentPath}]`, notification.getDismissedReason());
            }
          });
        } catch (err) {
          console.warn('[GSI prompt error]', err);
          setIsNativePromptShowing(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [currentPath, autoPrompt, clientId, user, isReady]);

  const renderGoogleButton = useCallback(
    (containerElement, customOptions = {}) => {
      if (!containerElement || !window.google?.accounts?.id || !clientId) return;
      try {
        if (!globalGsiInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false
          });
          globalGsiInitialized = true;
        }
        window.google.accounts.id.renderButton(containerElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 280,
          ...customOptions
        });
      } catch (e) {
        console.warn('Could not render Google Button', e);
      }
    },
    [clientId, handleCredentialResponse]
  );

  const promptOneTap = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isDisplayed()) {
          setIsNativePromptShowing(true);
        }
      });
    }
  }, []);

  return {
    clientId,
    isReady,
    isNativePromptShowing,
    isAuthenticating,
    renderGoogleButton,
    promptOneTap,
    handleCredentialResponse
  };
}
