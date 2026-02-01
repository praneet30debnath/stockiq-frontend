/**
 * NSE Market Holiday Calendar
 * Source: https://www.nseindia.com/api/holiday-master?type=trading&year=YYYY
 *
 * How to update:
 * 1. Visit: https://www.nseindia.com/resources/exchange-communication-holidays
 * 2. Or fetch from API: https://www.nseindia.com/api/holiday-master?type=trading&year=2026
 * 3. Copy the "CM" (Capital Market) section
 * 4. Update the MARKET_HOLIDAYS array below
 *
 * Last updated: January 2026
 */

export interface MarketHoliday {
  date: string; // YYYY-MM-DD format
  day: string;
  occasion: string;
}

/**
 * Special Trading Days - Weekend days when market is exceptionally open
 * These dates override the normal weekend closure
 */
const SPECIAL_TRADING_DAYS: { date: string; occasion: string }[] = [
  { date: '2026-02-01', occasion: 'Union Budget 2026 - Special Trading Session' },
];

/**
 * Check if a date is a special trading day (weekend but market is open)
 */
const isSpecialTradingDay = (date: string | Date): { isSpecial: boolean; occasion?: string } => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const special = SPECIAL_TRADING_DAYS.find(s => s.date === dateStr);
  return {
    isSpecial: !!special,
    occasion: special?.occasion,
  };
};

/**
 * NSE Capital Market (CM) Trading Holidays
 * Source: NSE API (CM section)
 */
const MARKET_HOLIDAYS: MarketHoliday[] = [
  // 2026 Holidays (from NSE API - CM section)
  { date: '2026-01-15', day: 'Thursday', occasion: 'Municipal Corporation Election - Maharashtra' },
  { date: '2026-01-26', day: 'Monday', occasion: 'Republic Day' },
  { date: '2026-02-15', day: 'Sunday', occasion: 'Mahashivratri' },
  { date: '2026-03-03', day: 'Tuesday', occasion: 'Holi' },
  { date: '2026-03-21', day: 'Saturday', occasion: 'Id-Ul-Fitr (Ramadan Eid)' },
  { date: '2026-03-26', day: 'Thursday', occasion: 'Shri Ram Navami' },
  { date: '2026-03-31', day: 'Tuesday', occasion: 'Shri Mahavir Jayanti' },
  { date: '2026-04-03', day: 'Friday', occasion: 'Good Friday' },
  { date: '2026-04-14', day: 'Tuesday', occasion: 'Dr. Baba Saheb Ambedkar Jayanti' },
  { date: '2026-05-01', day: 'Friday', occasion: 'Maharashtra Day' },
  { date: '2026-05-28', day: 'Thursday', occasion: 'Bakri Id' },
  { date: '2026-06-26', day: 'Friday', occasion: 'Muharram' },
  { date: '2026-08-15', day: 'Saturday', occasion: 'Independence Day' },
  { date: '2026-09-14', day: 'Monday', occasion: 'Ganesh Chaturthi' },
  { date: '2026-10-02', day: 'Friday', occasion: 'Mahatma Gandhi Jayanti' },
  { date: '2026-10-20', day: 'Tuesday', occasion: 'Dussehra' },
  { date: '2026-11-08', day: 'Sunday', occasion: 'Diwali Laxmi Pujan*' },
  { date: '2026-11-10', day: 'Tuesday', occasion: 'Diwali-Balipratipada' },
  { date: '2026-11-24', day: 'Tuesday', occasion: 'Prakash Gurpurb Sri Guru Nanak Dev' },
  { date: '2026-12-25', day: 'Friday', occasion: 'Christmas' },
];

/**
 * Check if a given date is a market holiday
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns Object with isHoliday flag and holiday details
 */
export const isMarketHoliday = (date: string | Date): { isHoliday: boolean; occasion?: string; day?: string } => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  const holiday = MARKET_HOLIDAYS.find(h => h.date === dateStr);

  return {
    isHoliday: !!holiday,
    occasion: holiday?.occasion,
    day: holiday?.day,
  };
};

/**
 * Check if a given date is a weekend (Saturday or Sunday)
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns true if weekend
 */
export const isWeekend = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const day = dateObj.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Check if market is open on a given date
 * Returns false for weekends and holidays
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns Object with isOpen flag and reason if closed
 */
export const isMarketOpen = (date: string | Date): { isOpen: boolean; reason?: string } => {
  // Check for special trading days first (weekends where market is open)
  const specialCheck = isSpecialTradingDay(date);
  if (specialCheck.isSpecial) {
    return { isOpen: true, reason: specialCheck.occasion };
  }

  // Check weekend
  if (isWeekend(date)) {
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    const day = dateObj.getDay();
    return {
      isOpen: false,
      reason: day === 0 ? 'Market is closed on Sunday' : 'Market is closed on Saturday',
    };
  }

  // Check holiday
  const holidayCheck = isMarketHoliday(date);
  if (holidayCheck.isHoliday) {
    return {
      isOpen: false,
      reason: `${holidayCheck.occasion} - Market is closed`,
    };
  }

  return { isOpen: true };
};

/**
 * Get the next trading day from a given date
 * @param fromDate - Starting date
 * @returns Next trading day in YYYY-MM-DD format
 */
export const getNextTradingDay = (fromDate: string | Date): string => {
  // Parse the date string to avoid timezone issues
  let dateStr = typeof fromDate === 'string' ? fromDate : fromDate.toISOString().split('T')[0];

  // Check next 30 days maximum
  for (let i = 0; i < 30; i++) {
    // Increment date by parsing and adding days
    const [year, month, day] = dateStr.split('-').map(Number);
    const nextDate = new Date(year, month - 1, day + 1); // month is 0-indexed

    // Format back to YYYY-MM-DD
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    dateStr = `${nextYear}-${nextMonth}-${nextDay}`;

    if (isMarketOpen(dateStr).isOpen) {
      return dateStr;
    }
  }

  return '';
};

/**
 * Get all holidays for a specific year
 * @param year - Year to get holidays for
 * @returns Array of holidays for that year
 */
export const getHolidaysForYear = (year: number): MarketHoliday[] => {
  return MARKET_HOLIDAYS.filter(h => h.date.startsWith(year.toString()));
};

/**
 * Check if the market is currently open (real-time check)
 * Indian stock market (NSE/BSE) trading hours: 9:15 AM - 3:30 PM IST
 * Checks: weekend, holiday, and trading hours
 * @returns Object with isOpen flag and reason if closed
 */
export const isMarketCurrentlyOpen = (): { isOpen: boolean; reason?: string } => {
  const now = new Date();

  // Get current time in IST
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istTime = new Date(utcTime + istOffset);

  // Get today's date string in YYYY-MM-DD format
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Check if it's a trading day (not weekend, not holiday)
  const tradingDayCheck = isMarketOpen(todayStr);
  if (!tradingDayCheck.isOpen) {
    return tradingDayCheck;
  }

  // Check trading hours
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Market hours: 9:15 AM (555 mins) to 3:30 PM (930 mins) IST
  const marketOpen = 9 * 60 + 15;   // 9:15 AM = 555 minutes
  const marketClose = 15 * 60 + 30; // 3:30 PM = 930 minutes

  if (currentMinutes < marketOpen) {
    return {
      isOpen: false,
      reason: 'Market opens at 9:15 AM IST',
    };
  }

  if (currentMinutes >= marketClose) {
    return {
      isOpen: false,
      reason: 'Market closed at 3:30 PM IST',
    };
  }

  return { isOpen: true };
};
