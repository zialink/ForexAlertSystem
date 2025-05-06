import { useState, useEffect } from "react";
import { 
  MARKETS, 
  Market, 
  getTimeInTimeZone, 
  isMarketOpen,
  formatTimeLeft,
  getMarketOpeningTime,
  getMarketClosingTime,
  findNextMarketToOpen
} from "@/lib/market-data";
import { useSettings } from "./use-settings";
import { useNotifications } from "./use-notifications";

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [nextMarketToOpen, setNextMarketToOpen] = useState<Market>(MARKETS[0] as Market);
  const [previousMarketStates, setPreviousMarketStates] = useState<Record<string, boolean>>({});
  
  const { settings } = useSettings();
  const { triggerNotification, playSound } = useNotifications();
  
  // Update markets every second
  useEffect(() => {
    function updateMarketStatuses() {
      const updatedMarkets = MARKETS.map(market => {
        // Get current time in market's time zone
        const currentTimeInZone = getTimeInTimeZone(market.timeZoneId);
        
        // Check if market is open
        const open = isMarketOpen(currentTimeInZone, market.openHour, market.closeHour);
        
        // Calculate opening and closing times
        const openingTime = getMarketOpeningTime(
          market.timeZoneId, 
          market.openHour, 
          currentTimeInZone
        );
        
        const closingTime = getMarketClosingTime(
          market.timeZoneId, 
          market.closeHour, 
          currentTimeInZone,
          open
        );
        
        // Calculate countdown time (to next open or next close)
        const targetTime = open ? closingTime : openingTime;
        const msLeft = targetTime.getTime() - new Date().getTime();
        
        return {
          ...market,
          isOpen: open,
          countdown: formatTimeLeft(msLeft),
          openingTime,
          closingTime,
        };
      });
      
      // Find next market to open
      const next = findNextMarketToOpen(updatedMarkets);
      
      // Check for state changes for notifications
      const newMarketStates = updatedMarkets.reduce<Record<string, boolean>>(
        (acc, market) => {
          acc[market.id] = market.isOpen;
          return acc;
        }, 
        {}
      );
      
      // Check if any market just opened
      updatedMarkets.forEach(market => {
        const previousState = previousMarketStates[market.id];
        // If market just opened and we have a previous state
        if (market.isOpen && previousState === false) {
          // Check if notifications are enabled for this market
          if (
            settings.enableNotifications && 
            settings.marketNotifications.includes(market.id)
          ) {
            triggerNotification(market);
          }
          
          // Check if sound alerts are enabled for this market
          if (
            settings.enableSounds && 
            settings.marketSounds.includes(market.id)
          ) {
            playSound(settings.volume);
          }
        }
      });
      
      // Update previous states
      setPreviousMarketStates(newMarketStates);
      setMarkets(updatedMarkets);
      setNextMarketToOpen(next);
    }
    
    // Initialize market states on first run
    if (Object.keys(previousMarketStates).length === 0) {
      const initialStates = MARKETS.reduce<Record<string, boolean>>(
        (acc, market) => {
          const currentTimeInZone = getTimeInTimeZone(market.timeZoneId);
          acc[market.id] = isMarketOpen(currentTimeInZone, market.openHour, market.closeHour);
          return acc;
        },
        {}
      );
      setPreviousMarketStates(initialStates);
    }
    
    // Run immediately and set interval
    updateMarketStatuses();
    
    const intervalId = setInterval(updateMarketStatuses, 1000);
    
    return () => clearInterval(intervalId);
  }, [settings, previousMarketStates, triggerNotification, playSound]);
  
  return { markets, nextMarketToOpen };
}
