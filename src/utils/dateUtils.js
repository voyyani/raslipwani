import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format date to readable string
 * @param {String|Date} date - Date to format
 * @param {String} formatStr - Format string (default: 'MMM dd, yyyy')
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '';
  
  return format(parsedDate, formatStr);
};

/**
 * Format date with time
 * @param {String|Date} date - Date to format
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {String|Date} date - Date to format
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '';
  
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {String|Date} date - Date to format
 */
export const formatDateForInput = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Format date for datetime-local input
 * @param {String|Date} date - Date to format
 */
export const formatDateTimeForInput = (date) => {
  return formatDate(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Check if date is in the past
 * @param {String|Date} date - Date to check
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return parsedDate < new Date();
};

/**
 * Check if date is today
 * @param {String|Date} date - Date to check
 */
export const isToday = (date) => {
  if (!date) return false;
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return parsedDate.getDate() === today.getDate() &&
         parsedDate.getMonth() === today.getMonth() &&
         parsedDate.getFullYear() === today.getFullYear();
};
