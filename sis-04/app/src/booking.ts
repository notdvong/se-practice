import type { Interval, Room } from './rooms';

export const MAX_MINUTES = 120; // AC2
export const MINUTES_PER_DAY = 1440; // 24:00

// AC1-AC5. Same decisions as the starter's check(): the request must satisfy
// 0 <= start < end <= 1440 and start after `now` (AC1), last at most 120 minutes (AC2),
// the room must not be blocked (AC3) and no booking may overlap it (AC4, strict: touching is fine).
// It only reads its arguments and returns a Boolean, so it changes nothing (AC5).
export function canBook({
  start,
  end,
  now,
  blocked,
  bookings,
}: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: readonly Interval[];
}): boolean {
  if (!(0 <= start && start < end && end <= MINUTES_PER_DAY)) return false;
  if (!(start > now)) return false;
  if (end - start > MAX_MINUTES) return false;
  if (blocked) return false;
  for (const booked of bookings) {
    if (start < booked.end && end > booked.start) return false;
  }
  return true;
}

// F3 and F5: find the chosen room and decide with THAT room's own blocked flag and bookings.
// An unknown id is not available.
export function checkRoom(
  rooms: readonly Room[],
  roomId: string,
  request: { start: number; end: number; now: number },
): boolean {
  const room = rooms.find((candidate) => candidate.id === roomId);
  if (!room) return false;
  return canBook({ ...request, blocked: room.blocked, bookings: room.bookings });
}
