import { useCallback } from "react";
import { Market } from "@/lib/market-data";
import { useSettings } from "./use-settings";

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
      new Notification(`${market.name} Market Opening`, {
        body: `The ${market.name} forex market is now open for trading.`,
        icon: "https://cdn-icons-png.flaticon.com/512/2942/2942789.png"
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
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
  
  return {
    requestPermission,
    triggerNotification,
    playSound,
    testSound
  };
}
