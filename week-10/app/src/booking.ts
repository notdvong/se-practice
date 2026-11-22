export type Booking = { start: number; end: number };
export type CanBookInput = {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
};

/** Check a requested time; this reconstructed baseline does not save a booking. */
export function canBook({ start, end, now, blocked, bookings }: CanBookInput): boolean {
  if (!(Number.isInteger(start) && Number.isInteger(end) && Number.isInteger(now))) return false;
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const booking of bookings) {
    if (start < booking.end && end > booking.start) return false;
  }
  return true;
}
