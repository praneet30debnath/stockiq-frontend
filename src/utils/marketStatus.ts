import { isMarketOpen as checkMarketHoliday, getNextTradingDay } from './marketHolidays';

export interface MarketStatus {
  isOpen: boolean;
  message: string;
  nextChange?: string;
}

export const getMarketStatus = (): MarketStatus => {
  // Get current time in IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);

  // Get IST date in YYYY-MM-DD format
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const date = String(istTime.getUTCDate()).padStart(2, '0');
  const todayDateStr = `${year}-${month}-${date}`;

  // Check if today is a trading day (not weekend/holiday)
  const holidayCheck = checkMarketHoliday(todayDateStr);

  // Get IST day and time components
  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Market hours in IST: 9:15 AM to 3:30 PM
  const marketOpen = 9 * 60 + 15; // 9:15 AM = 555 minutes
  const marketClose = 15 * 60 + 30; // 3:30 PM = 930 minutes

  // Check if current time is within market hours
  const isDuringMarketHours = timeInMinutes >= marketOpen && timeInMinutes < marketClose;

  // Market is open if: it's a trading day AND during market hours
  if (holidayCheck.isOpen && isDuringMarketHours) {
    const closeHour = Math.floor(marketClose / 60);
    const closeMinute = marketClose % 60;
    return {
      isOpen: true,
      message: 'Market Open',
      nextChange: `Closes at ${closeHour % 12 || 12}:${closeMinute.toString().padStart(2, '0')} PM`,
    };
  }

  // Market is closed - determine reason and next opening
  let nextOpenMessage: string;

  if (!holidayCheck.isOpen) {
    // Closed due to weekend/holiday
    const nextTradingDay = getNextTradingDay(todayDateStr);

    if (nextTradingDay) {
      const nextDate = new Date(nextTradingDay + 'T00:00:00');
      const today = new Date(todayDateStr + 'T00:00:00');
      const daysDiff = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        nextOpenMessage = 'Opens Tomorrow at 9:15 AM';
      } else if (daysDiff <= 3) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        nextOpenMessage = `Opens ${dayNames[nextDate.getDay()]} at 9:15 AM`;
      } else {
        nextOpenMessage = `Opens on ${nextDate.getDate()}/${nextDate.getMonth() + 1} at 9:15 AM`;
      }
    } else {
      nextOpenMessage = holidayCheck.reason || 'Market Closed';
    }
  } else if (timeInMinutes >= marketClose) {
    // Closed because market hours ended
    const nextTradingDay = getNextTradingDay(todayDateStr);
    if (nextTradingDay === todayDateStr) {
      // Edge case: shouldn't happen
      nextOpenMessage = 'Opens Tomorrow at 9:15 AM';
    } else {
      const nextDate = new Date(nextTradingDay + 'T00:00:00');
      const today = new Date(todayDateStr + 'T00:00:00');
      const daysDiff = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        nextOpenMessage = 'Opens Tomorrow at 9:15 AM';
      } else {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        nextOpenMessage = `Opens ${dayNames[nextDate.getDay()]} at 9:15 AM`;
      }
    }
  } else {
    // Before market hours (but is a trading day)
    nextOpenMessage = 'Opens Today at 9:15 AM';
  }

  return {
    isOpen: false,
    message: 'Market Closed',
    nextChange: nextOpenMessage,
  };
};
