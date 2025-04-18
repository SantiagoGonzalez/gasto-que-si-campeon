import { format as formatDateFns, parseISO, startOfMonth } from "date-fns"

// Re-export the functions we need
export const formatDate = formatDateFns
export const parseISODate = parseISO
export const getStartOfMonth = startOfMonth

// Helper function for formatting dates in a consistent way
export function formatDisplayDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDateFns(dateObj, "MMMM d, yyyy")
}

export function formatMonthYear(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDateFns(dateObj, "MMMM yyyy")
}

