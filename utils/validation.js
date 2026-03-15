/**
 * Validates a date (day, month, year)
 * @param {number|string} day 
 * @param {number|string} month 
 * @param {number|string} year 
 * @returns {boolean}
 */
export const isValidDate = (day, month, year) => {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12) return false;
  if (y < 1900 || y > 2100) return false;

  const daysInMonth = new Date(y, m, 0).getDate();
  return d >= 1 && d <= daysInMonth;
};
