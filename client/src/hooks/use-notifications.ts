import { useCallback } from "react";
import { Market } from "@/lib/market-data";
import { useSettings } from "./use-settings";
import { apiRequest } from "@/lib/queryClient";

// Create an audio element for notifications
const notificationSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export function useNotifications() {
  const { settings } = useSettings();
  
  // Check if notifications are supported
  const isNotificationSupported = () => {
    return 'Notification' in window;
  };
  
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isNotificationSupported()) {
      console.warn("Browser does not support notifications");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  }, []);
  
  // Show a browser notification
  const triggerNotification = useCallback((market: Market) => {
    if (!isNotificationSupported() || Notification.permission !== "granted") {
      return;
    }
    
    try {
      // Local browser notification
      new Notification(`${market.name} Market Opening`, {
        body: `The ${market.name} forex market is now open for trading.`,
        icon: "/notification-icon.png"
      });
      
      // Also send push notification to mobile devices
      sendPushNotification(market);
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }, []);
  
  // Send push notification to all subscribers (used for market openings)
  const sendPushNotification = useCallback(async (market: Market) => {
    try {
      await apiRequest('/api/notify/market-opening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: market.id,
          marketName: market.name
        }),
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }, []);
  
  // Play notification sound
  const playSound = useCallback((volume: number) => {
    if (!settings.enableSounds) return;
    
    try {
      // Set volume (0-100 to 0-1)
      notificationSound.volume = volume / 100;
      
      // Play sound
      notificationSound.play().catch(error => {
        console.error("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [settings.enableSounds]);
  
  // Play sound for testing
  const testSound = useCallback(() => {
    playSound(settings.volume);
  }, [playSound, settings.volume]);
  
  // Send a test push notification to all subscribed devices
  const testPushNotification = useCallback(async () => {
    try {
      await apiRequest('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification from the Forex Market Tracker app.'
        }),
      });
      return true;
    } catch (error) {
      console.error('Failed to send test push notification:', error);
      return false;
    }
  }, []);
  
  return {
    requestPermission,
    triggerNotification,
    playSound,
    testSound,
    testPushNotification
  };
}
