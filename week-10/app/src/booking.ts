import { isSlotAvailable } from './availability';

export type Booking = {
  start: number;
  end: number;
};

export type CanBookInput = {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
};

/** Keep the original Week 07/08 interface; availability policy lives in a pure module. */
export function canBook(input: CanBookInput): boolean {
  return isSlotAvailable(input);
}
