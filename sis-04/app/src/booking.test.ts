import { test, expect } from 'vitest';
import { canBook, checkRoom } from './booking';
import { filterRooms } from './filter';
import type { Room } from './rooms';

// Fixed catalog for these tests (minutes after midnight: 600 = 10:00). It is not the page's ROOMS.
const NOW = 540; // 09:00
const rooms: Room[] = [
  { id: 'x1', name: 'Room X', capacity: 12, equipment: ['projector'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'y2', name: 'Room Y', capacity: 20, equipment: ['projector', 'whiteboard'], blocked: true, bookings: [] },
  { id: 'z3', name: 'Room Z', capacity: 4, equipment: [], blocked: false, bookings: [] },
];
const booked = [{ start: 660, end: 720 }]; // 11:00-12:00

test('AC1 a request that starts and ends at the same minute is rejected', () => {
  expect(canBook({ start: 600, end: 600, now: NOW, blocked: false, bookings: [] })).toBe(false);
});

test('AC1 a request that ends before it starts is rejected', () => {
  expect(canBook({ start: 660, end: 600, now: NOW, blocked: false, bookings: [] })).toBe(false);
});

test('AC1 a request that starts in the past is rejected', () => {
  expect(canBook({ start: 480, end: 540, now: NOW, blocked: false, bookings: [] })).toBe(false);
});

test('AC1 a request that starts exactly at the current time is rejected', () => {
  expect(canBook({ start: NOW, end: 600, now: NOW, blocked: false, bookings: [] })).toBe(false);
});

test('AC1 a request that ends after 24:00 is rejected, one that ends at 24:00 is accepted', () => {
  expect(canBook({ start: 1400, end: 1500, now: NOW, blocked: false, bookings: [] })).toBe(false);
  expect(canBook({ start: 1380, end: 1440, now: NOW, blocked: false, bookings: [] })).toBe(true);
});

test('B1 AC2 exactly 120 minutes (720-840) is available', () => {
  expect(canBook({ start: 720, end: 840, now: NOW, blocked: false, bookings: [] })).toBe(true);
});

test('B2 AC2 121 minutes (720-841) is rejected', () => {
  expect(canBook({ start: 720, end: 841, now: NOW, blocked: false, bookings: [] })).toBe(false);
});

test('AC3 a blocked room is rejected even when the slot is free', () => {
  expect(canBook({ start: 600, end: 660, now: NOW, blocked: true, bookings: [] })).toBe(false);
});

test('B3 AC4 touching an existing booking at its start (600-660 vs 660-720) is available', () => {
  expect(canBook({ start: 600, end: 660, now: NOW, blocked: false, bookings: booked })).toBe(true);
});

test('B3 AC4 touching an existing booking at its end (720-780 vs 660-720) is available', () => {
  expect(canBook({ start: 720, end: 780, now: NOW, blocked: false, bookings: booked })).toBe(true);
});

test('B4 AC4 overlapping an existing booking (630-690 vs 660-720) is rejected', () => {
  expect(canBook({ start: 630, end: 690, now: NOW, blocked: false, bookings: booked })).toBe(false);
});

test('AC4 a request that contains an existing booking (630-750 vs 660-720) is rejected', () => {
  expect(canBook({ start: 630, end: 750, now: NOW, blocked: false, bookings: booked })).toBe(false);
});

test('AC5 canBook leaves the bookings it was given unchanged', () => {
  const bookings = [{ start: 660, end: 720 }, { start: 600, end: 630 }];
  const copy = JSON.parse(JSON.stringify(bookings));
  canBook({ start: 630, end: 690, now: NOW, blocked: false, bookings });
  expect(bookings).toEqual(copy);
});

test('AC5 checkRoom leaves the catalog unchanged', () => {
  const copy = JSON.parse(JSON.stringify(rooms));
  checkRoom(rooms, 'x1', { start: 600, end: 660, now: NOW });
  expect(rooms).toEqual(copy);
});

test('F3 a blocked room is never available, even for a valid free slot', () => {
  expect(checkRoom(rooms, 'y2', { start: 720, end: 780, now: NOW })).toBe(false);
});

test('F5 the same times give different answers for different rooms: each uses its own bookings', () => {
  const request = { start: 600, end: 660, now: NOW };
  expect(checkRoom(rooms, 'x1', request)).toBe(false); // Room X is booked 10:00-11:00
  expect(checkRoom(rooms, 'z3', request)).toBe(true); // Room Z has no bookings
});

test('F5 an unknown room id is not available', () => {
  expect(checkRoom(rooms, 'nope', { start: 720, end: 780, now: NOW })).toBe(false);
});

test('INT filterRooms then checkRoom on what it returned', () => {
  const shown = filterRooms(rooms, { attendees: 10, equipment: ['projector'] });
  expect(shown.map((room) => room.id)).toEqual(['x1', 'y2']);
  const free = { start: 660, end: 720, now: NOW };
  expect(checkRoom(shown, 'x1', free)).toBe(true); // touches Room X's 10:00-11:00 booking only
  expect(checkRoom(shown, 'y2', free)).toBe(false); // Room Y is blocked
  expect(checkRoom(shown, 'z3', free)).toBe(false); // Room Z was filtered out, so it is not in the list
});
