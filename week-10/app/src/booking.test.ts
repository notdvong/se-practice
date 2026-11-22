import { describe, expect, test } from 'vitest';
import { canBook, type Booking } from './booking';

const base = {
  start: 600,
  end: 660,
  now: 540,
  blocked: false,
  bookings: [] as Booking[],
};

describe('canBook — Smart Campus acceptance contract', () => {
  test('T01 rejects a zero-length interval', () => {
    expect(canBook({ ...base, start: 600, end: 600 })).toBe(false);
  });

  test('T02 rejects a reversed interval', () => {
    expect(canBook({ ...base, start: 660, end: 600 })).toBe(false);
  });

  test('T03 rejects a start before midnight', () => {
    expect(canBook({ ...base, start: -1 })).toBe(false);
  });

  test('T04 rejects an end after 24:00', () => {
    expect(canBook({ ...base, end: 1441 })).toBe(false);
  });

  test('T05 rejects a request that starts at the supplied current time', () => {
    expect(canBook({ ...base, start: 540 })).toBe(false);
  });

  test('T06 accepts a request exactly 120 minutes long', () => {
    expect(canBook({ ...base, start: 600, end: 720 })).toBe(true);
  });

  test('T07 rejects a request longer than 120 minutes', () => {
    expect(canBook({ ...base, start: 600, end: 721 })).toBe(false);
  });

  test('T08 rejects a blocked room', () => {
    expect(canBook({ ...base, blocked: true })).toBe(false);
  });

  test('T09 rejects a request that overlaps an existing booking', () => {
    expect(canBook({ ...base, bookings: [{ start: 630, end: 690 }] })).toBe(false);
  });

  test('T10 allows a request that touches an existing booking at its start', () => {
    expect(canBook({ ...base, bookings: [{ start: 660, end: 720 }] })).toBe(true);
  });

  test('T11 allows a request that touches an existing booking at its end', () => {
    expect(canBook({ ...base, start: 540, end: 600, now: 500, bookings: [{ start: 600, end: 660 }] })).toBe(true);
  });

  test('T12 allows a request separated from existing bookings', () => {
    expect(canBook({ ...base, bookings: [{ start: 720, end: 780 }] })).toBe(true);
  });

  test('T13 does not change the caller booking list', () => {
    const bookings = [{ start: 720, end: 780 }];
    const copy = structuredClone(bookings);
    canBook({ ...base, bookings });
    expect(bookings).toEqual(copy);
  });

  test('T14 accepts an interval ending at 24:00', () => {
    expect(canBook({ ...base, start: 1380, end: 1440, now: 1320 })).toBe(true);
  });

});
