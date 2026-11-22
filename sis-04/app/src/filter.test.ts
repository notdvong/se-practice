import { test, expect } from 'vitest';
import { filterRooms } from './filter';
import type { Room } from './rooms';

// A fixed catalog, independent of the page's ROOMS, so changing the demo data cannot change a result.
const catalog: Room[] = [
  { id: 'r1', name: 'Alpha', capacity: 4, equipment: ['tv'], blocked: false, bookings: [] },
  { id: 'r2', name: 'Beta', capacity: 8, equipment: ['tv', 'whiteboard'], blocked: false, bookings: [] },
  { id: 'r3', name: 'Gamma', capacity: 12, equipment: ['whiteboard', 'projector'], blocked: true, bookings: [] },
  { id: 'r4', name: 'Delta', capacity: 20, equipment: ['tv', 'whiteboard', 'projector'], blocked: false, bookings: [] },
];

const ids = (rooms: { id: string }[]) => rooms.map((r) => r.id);

test('F1 rooms with capacity at least the attendees are kept', () => {
  const result = filterRooms(catalog, { attendees: 10, equipment: [] });
  expect(ids(result)).toEqual(['r3', 'r4']);
});

test('F2 a room must have all selected equipment, not just any', () => {
  const result = filterRooms(catalog, { attendees: 1, equipment: ['tv', 'whiteboard'] });
  expect(ids(result)).toEqual(['r2', 'r4']);
});

test('F2 three selected items leave only the room that has all three', () => {
  const result = filterRooms(catalog, { attendees: 1, equipment: ['tv', 'whiteboard', 'projector'] });
  expect(ids(result)).toEqual(['r4']);
});

test('F2 an empty equipment list applies no equipment filter', () => {
  const result = filterRooms(catalog, { attendees: 1, equipment: [] });
  expect(ids(result)).toEqual(['r1', 'r2', 'r3', 'r4']);
});

test('F4 returns an empty array when nothing matches', () => {
  const result = filterRooms(catalog, { attendees: 21, equipment: [] });
  expect(result).toEqual([]);
});

test('B5 a room whose capacity equals the attendees is included', () => {
  const result = filterRooms(catalog, { attendees: 8, equipment: [] });
  expect(ids(result)).toContain('r2');
});

test('B6 a room whose capacity is one below the attendees is excluded', () => {
  const result = filterRooms(catalog, { attendees: 9, equipment: [] });
  expect(ids(result)).not.toContain('r2');
});

test('blocked rooms are not removed by the filter', () => {
  const result = filterRooms(catalog, { attendees: 12, equipment: ['projector'] });
  expect(ids(result)).toEqual(['r3', 'r4']);
});

test('the input catalog is not changed', () => {
  const copy = JSON.parse(JSON.stringify(catalog));
  filterRooms(catalog, { attendees: 8, equipment: ['tv'] });
  expect(catalog).toEqual(copy);
});
