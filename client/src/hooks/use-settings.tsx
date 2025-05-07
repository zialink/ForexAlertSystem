import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react";
import { MARKETS } from "../lib/market-data";
import { getFromLocalStorage, saveToLocalStorage } from "../lib/utils";
import { auth } from '@/lib/firebase';

// Interface for the settings
interface Settings {
  enableNotifications: boolean;
  enableSounds: boolean;
  volume: number;
  marketsToMonitor: string[];
  marketNotifications: string[];
  marketSounds: string[];
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  enableNotifications: true,
  enableSounds: true,
  volume: 75,
  marketsToMonitor: MARKETS.map(m => m.id),
  marketNotifications: ["tokyo", "london"],  // Default enabled markets for notifications
  marketSounds: ["tokyo", "london"],         // Default enabled markets for sounds
};

// Settings context type
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  updateMarketNotification: (marketId: string, enabled: boolean) => void;
  updateMarketSound: (marketId: string, enabled: boolean) => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  // Get current user from Firebase auth
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const settingsKey = currentUser ? `forexTrackerSettings_${currentUser.uid}` : "forexTrackerSettings_guest";
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  const [settings, setSettings] = useState<Settings>(() => 
    getFromLocalStorage(settingsKey, DEFAULT_SETTINGS)
  );
  
  // Update settings when user changes
  useEffect(() => {
    setSettings(getFromLocalStorage(settingsKey, DEFAULT_SETTINGS));
  }, [currentUser, settingsKey]);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(settingsKey, settings);
  }, [settings, settingsKey]);
  
  // Update settings
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };
  
  // Toggle notifications for a specific market
  const updateMarketNotification = (marketId: string, enabled: boolean) => {
    setSettings(prev => {
      let marketNotifications = [...prev.marketNotifications];
      
      if (enabled) {
        if (!marketNotifications.includes(marketId)) {
          marketNotifications.push(marketId);
        }
      } else {
        marketNotifications = marketNotifications.filter(id => id !== marketId);
      }
      
      return {
        ...prev,
        marketNotifications
      };
    });
  };
  
  // Toggle sound alerts for a specific market
  const updateMarketSound = (marketId: string, enabled: boolean) => {
    setSettings(prev => {
      let marketSounds = [...prev.marketSounds];
      
      if (enabled) {
        if (!marketSounds.includes(marketId)) {
          marketSounds.push(marketId);
        }
      } else {
        marketSounds = marketSounds.filter(id => id !== marketId);
      }
      
      return {
        ...prev,
        marketSounds
      };
    });
  };
  
  const contextValue = {
    settings,
    updateSettings,
    updateMarketNotification,
    updateMarketSound
  };
  
  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  
  return context;
}