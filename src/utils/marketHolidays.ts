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
 * Last updated: December 2024
 */

export interface MarketHoliday {
  date: string; // YYYY-MM-DD format
  day: string;
  occasion: string;
}

/**
 * NSE Capital Market (CM) Trading Holidays
 * Source: NSE API (CM section)
 */
const MARKET_HOLIDAYS: MarketHoliday[] = [
  // 2024 Holidays
  { date: '2024-01-26', day: 'Friday', occasion: 'Republic Day' },
  { date: '2024-03-08', day: 'Friday', occasion: 'Mahashivratri' },
  { date: '2024-03-25', day: 'Monday', occasion: 'Holi' },
  { date: '2024-03-29', day: 'Friday', occasion: 'Good Friday' },
  { date: '2024-04-11', day: 'Thursday', occasion: 'Id-Ul-Fitr (Ramadan Eid)' },
  { date: '2024-04-17', day: 'Wednesday', occasion: 'Shri Ram Navami' },
  { date: '2024-04-21', day: 'Sunday', occasion: 'Mahavir Jayanti' },
  { date: '2024-05-01', day: 'Wednesday', occasion: 'Maharashtra Day' },
  { date: '2024-05-23', day: 'Thursday', occasion: 'Buddha Pournima' },
  { date: '2024-06-17', day: 'Monday', occasion: 'Bakri Id' },
  { date: '2024-07-17', day: 'Wednesday', occasion: 'Moharram' },
  { date: '2024-08-15', day: 'Thursday', occasion: 'Independence Day' },
  { date: '2024-10-02', day: 'Wednesday', occasion: 'Mahatma Gandhi Jayanti' },
  { date: '2024-10-12', day: 'Saturday', occasion: 'Dussehra' },
  { date: '2024-11-01', day: 'Friday', occasion: 'Diwali - Laxmi Pujan' },
  { date: '2024-11-02', day: 'Saturday', occasion: 'Diwali - Balipratipada' },
  { date: '2024-11-15', day: 'Friday', occasion: 'Gurunanak Jayanti' },
  { date: '2024-12-25', day: 'Wednesday', occasion: 'Christmas' },

  // 2025 Holidays (from NSE API - CM section)
  { date: '2025-01-26', day: 'Sunday', occasion: 'Republic Day' },
  { date: '2025-02-26', day: 'Wednesday', occasion: 'Mahashivratri' },
  { date: '2025-03-14', day: 'Friday', occasion: 'Holi' },
  { date: '2025-03-31', day: 'Monday', occasion: 'Id-Ul-Fitr (Ramadan Eid)' },
  { date: '2025-04-06', day: 'Sunday', occasion: 'Shri Ram Navami' },
  { date: '2025-04-10', day: 'Thursday', occasion: 'Shri Mahavir Jayanti' },
  { date: '2025-04-14', day: 'Monday', occasion: 'Dr. Baba Saheb Ambedkar Jayanti' },
  { date: '2025-04-18', day: 'Friday', occasion: 'Good Friday' },
  { date: '2025-05-01', day: 'Thursday', occasion: 'Maharashtra Day' },
  { date: '2025-06-07', day: 'Saturday', occasion: 'Bakri Id' },
  { date: '2025-07-06', day: 'Sunday', occasion: 'Muharram' },
  { date: '2025-08-15', day: 'Friday', occasion: 'Independence Day / Parsi New Year' },
  { date: '2025-08-27', day: 'Wednesday', occasion: 'Shri Ganesh Chaturthi' },
  { date: '2025-10-02', day: 'Thursday', occasion: 'Mahatma Gandhi Jayanti/Dussehra' },
  { date: '2025-10-21', day: 'Tuesday', occasion: 'Diwali Laxmi Pujan' },
  { date: '2025-10-22', day: 'Wednesday', occasion: 'Balipratipada' },
  { date: '2025-11-05', day: 'Wednesday', occasion: 'Prakash Gurpurb Sri Guru Nanak Dev' },
  { date: '2025-12-25', day: 'Thursday', occasion: 'Christmas' },
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
