type MonthFormat = 'short' | 'long';

/**
 * Return array of months
 * @param format short (JAN) or long (JANUARY) month format
 * @returns
 */
export const defaultMonths = (format: MonthFormat): string[] => {
  return [
    ...Array(12).keys()
  ]
    .map(key => new Date(0, key).toLocaleDateString('en', { month: format }).toUpperCase());
}

export const defaultMonthFormat = 'MMM YYYY';
