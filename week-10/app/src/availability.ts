import type { Booking, CanBookInput } from './booking';

function isValidInterval(start: number, end: number): boolean {
  return Number.isInteger(start) && Number.isInteger(end) && 0 <= start && start < end && end <= 1440;
}

/** Pure availability policy. Invalid existing booking data fails closed. */
export function isSlotAvailable({ start, end, now, blocked, bookings }: CanBookInput): boolean {
  if (!isValidInterval(start, end) || !Number.isInteger(now) || now < 0 || now > 1440) return false;
  if (start <= now || end - start > 120 || blocked || !Array.isArray(bookings)) return false;

  // Do not treat malformed persisted/imported fixture entries as empty calendar space.
  if (bookings.some((booking: Booking) => !booking || !isValidInterval(booking.start, booking.end))) return false;

  // Half-open intervals: touching at either endpoint is allowed.
  return !bookings.some((booking) => start < booking.end && end > booking.start);
}
