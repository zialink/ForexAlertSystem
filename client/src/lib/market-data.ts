// Time zone data
export interface TimeZone {
  id: string;
  name: string;
  abbreviation: string;
  time: string;
  date: string;
  gmtOffset: number;
}

export interface Market {
  id: string;
  name: string;
  timeZoneId: string;
  openHour: number;
  closeHour: number;
  hours: string;
  isOpen: boolean;
  countdown: string;
  openingTime?: Date;
  closingTime?: Date;
}

// Market constants
export const MARKETS = [
  {
    id: "sydney",
    name: "Sydney",
    timeZoneId: "Australia/Sydney",
    openHour: 7,
    closeHour: 16,
    hours: "07:00 - 16:00 AEST",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    timeZoneId: "Asia/Tokyo",
    openHour: 9,
    closeHour: 18,
    hours: "09:00 - 18:00 JST",
  },
  {
    id: "london",
    name: "London",
    timeZoneId: "Europe/London",
    openHour: 8,
    closeHour: 17,
    hours: "08:00 - 17:00 BST",
  },
  {
    id: "newyork",
    name: "New York",
    timeZoneId: "America/New_York",
    openHour: 8,
    closeHour: 17,
    hours: "08:00 - 17:00 EDT",
  },
];

// Time zone data
export const TIME_ZONES: TimeZone[] = [
  {
    id: "America/New_York",
    name: "New York",
    abbreviation: "EDT",
    time: "",
    date: "",
    gmtOffset: -4,
  },
  {
    id: "Asia/Tokyo",
    name: "Tokyo",
    abbreviation: "JST",
    time: "",
    date: "",
    gmtOffset: 9,
  },
  {
    id: "Europe/London",
    name: "London",
    abbreviation: "BST",
    time: "",
    date: "",
    gmtOffset: 1,
  },
  {
    id: "Australia/Sydney",
    name: "Sydney",
    abbreviation: "AEST",
    time: "",
    date: "",
    gmtOffset: 10,
  },
];

// Find the next market to open, considering markets may be open or closed
export function findNextMarketToOpen(markets: Market[]): Market {
  // First, filter out open markets
  const closedMarkets = markets.filter(market => !market.isOpen);
  
  if (closedMarkets.length === 0) {
    // All markets are open, find one that closes first
    return markets.sort((a, b) => {
      if (!a.closingTime || !b.closingTime) return 0;
      return a.closingTime.getTime() - b.closingTime.getTime();
    })[0];
  }
  
  // Sort closed markets by their opening time
  return closedMarkets.sort((a, b) => {
    if (!a.openingTime || !b.openingTime) return 0;
    return a.openingTime.getTime() - b.openingTime.getTime();
  })[0];
}

// Format time as HH:MM:SS
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format date as "Day, Month Date, Year"
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format time left as HH:MM:SS
export function formatTimeLeft(ms: number): string {
  if (ms < 0) return "00:00:00";
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 60 / 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
}

// Check if a market is open based on current time
export function isMarketOpen(
  currentTimeInZone: Date,
  openHour: number,
  closeHour: number
): boolean {
  const hours = currentTimeInZone.getHours();
  return hours >= openHour && hours < closeHour;
}

// Get time for a specific timezone with more robust handling
export function getTimeInTimeZone(timeZoneId: string): Date {
  try {
    // Use Intl.DateTimeFormat for better time zone handling
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const datePartMap: Record<string, string> = {};
    
    parts.forEach(part => {
      if (part.type !== 'literal') {
        datePartMap[part.type] = part.value;
      }
    });
    
    // Construct a date from the parts
    const year = parseInt(datePartMap.year);
    const month = parseInt(datePartMap.month) - 1; // JavaScript months are 0-based
    const day = parseInt(datePartMap.day);
    const hour = parseInt(datePartMap.hour);
    const minute = parseInt(datePartMap.minute);
    const second = parseInt(datePartMap.second);
    
    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.error(`Error getting time for timezone ${timeZoneId}:`, error);
    // Fallback to the previous method if the new method fails
    return new Date(new Date().toLocaleString('en-US', { timeZone: timeZoneId }));
  }
}

// Get market opening time for today or next day if already passed
export function getMarketOpeningTime(
  timeZoneId: string,
  openHour: number,
  currentTimeInZone: Date
): Date {
  const today = new Date(currentTimeInZone);
  today.setHours(openHour, 0, 0, 0);
  
  // If opening time has already passed today, get tomorrow's opening time
  if (today < currentTimeInZone) {
    today.setDate(today.getDate() + 1);
  }
  
  return today;
}

// Get market closing time for today or next day if already passed
export function getMarketClosingTime(
  timeZoneId: string,
  closeHour: number,
  currentTimeInZone: Date,
  isOpen: boolean
): Date {
  const today = new Date(currentTimeInZone);
  today.setHours(closeHour, 0, 0, 0);
  
  // If market is not open and closing time has already passed today, 
  // get tomorrow's closing time
  if (!isOpen && today < currentTimeInZone) {
    today.setDate(today.getDate() + 1);
  }
  
  return today;
}
