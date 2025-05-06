import { useState, useEffect } from "react";
import { TIME_ZONES, TimeZone, formatTime, formatDate, getTimeInTimeZone } from "@/lib/market-data";

export function useTime() {
  const [timeZones, setTimeZones] = useState<TimeZone[]>(
    TIME_ZONES.map(zone => ({
      ...zone,
      time: "00:00:00",
      date: "Loading...",
    }))
  );

  // Update the clocks every second
  useEffect(() => {
    function updateClocks() {
      const updatedTimeZones = TIME_ZONES.map(zone => {
        const now = getTimeInTimeZone(zone.id);
        return {
          ...zone,
          time: formatTime(now),
          date: formatDate(now),
        };
      });
      
      setTimeZones(updatedTimeZones);
    }
    
    // Update immediately and then set interval
    updateClocks();
    
    const intervalId = setInterval(updateClocks, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return { timeZones };
}
