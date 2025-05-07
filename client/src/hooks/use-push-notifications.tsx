import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

// Application server public key
const PUBLIC_VAPID_KEY = 'BLV5Gh2S9oi-7EywQ1Rm6tJ7N0GzElb4NbCNQ_JbJKJKECQ9Zsu-0ZCQt_YZGYt4IHGJ9wvpTN3xiTvCyRCpbDQ';

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  // Check if push notifications are supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  // Register the service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      toast({
        title: "Registration Error",
        description: "Could not register service worker for push notifications.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Convert the base64 public key to a Uint8Array for the subscription
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push notifications
  const subscribeUser = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device or browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsRegistering(true);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Permission Required",
          description: "Notification permission is required for mobile alerts.",
          variant: "destructive",
        });
        setIsRegistering(false);
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Get subscription or create one
      let pushSubscription = await registration.pushManager.getSubscription();
      
      if (!pushSubscription) {
        // Create a new subscription
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        };

        pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      }

      // Send the subscription to the server
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pushSubscription),
      });

      if (!response.ok) {
        throw new Error('Failed to store subscription on server');
      }

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      
      toast({
        title: "Success!",
        description: "You've subscribed to mobile push notifications.",
      });
      
      setIsRegistering(false);
      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Error",
        description: "Could not subscribe to push notifications. Try again later.",
        variant: "destructive",
      });
      setIsRegistering(false);
      return false;
    }
  }, [isSupported, registerServiceWorker, toast]);

  // Unsubscribe from push notifications
  const unsubscribeUser = useCallback(async () => {
    try {
      if (!subscription) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const currentSubscription = await registration.pushManager.getSubscription();
          if (currentSubscription) {
            setSubscription(currentSubscription);
          } else {
            setIsSubscribed(false);
            return true;
          }
        } else {
          setIsSubscribed(false);
          return true;
        }
      }

      // Unsubscribe from push manager
      const unsubscribed = await subscription?.unsubscribe();
      
      // Tell server to remove subscription
      if (unsubscribed && subscription) {
        await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setSubscription(null);
        setIsSubscribed(false);
        
        toast({
          title: "Unsubscribed",
          description: "You will no longer receive push notifications on this device.",
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unsubscription error:', error);
      toast({
        title: "Unsubscribe Error",
        description: "Could not unsubscribe from push notifications. Try again later.",
        variant: "destructive",
      });
      return false;
    }
  }, [subscription, toast]);

  // Check subscription status on component mount
  useEffect(() => {
    if (isSupported) {
      (async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const currentSubscription = await registration.pushManager.getSubscription();
            if (currentSubscription) {
              setSubscription(currentSubscription);
              setIsSubscribed(true);
            }
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      })();
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isRegistering,
    subscription,
    subscribeUser,
    unsubscribeUser
  };
}