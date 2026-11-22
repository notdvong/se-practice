// The catalog: data only. No rules live here (see booking.ts and filter.ts).
// Times are minutes after midnight, so 600 = 10:00. All rooms and bookings are fictional.

export type Interval = { start: number; end: number };

export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Interval[];
};

export const ROOMS: Room[] = [
  { id: 'a101', name: 'Room A-101', capacity: 8, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [{ start: 600, end: 660 }] },
  { id: 'b204', name: 'Room B-204', capacity: 12, equipment: ['whiteboard', 'video-conference'], blocked: false, bookings: [] },
  { id: 'c310', name: 'Lab C-310', capacity: 30, equipment: ['projector', 'whiteboard', 'computers'], blocked: false, bookings: [{ start: 540, end: 600 }, { start: 720, end: 840 }] },
  { id: 'd015', name: 'Studio D-015', capacity: 6, equipment: ['video-conference'], blocked: true, bookings: [] },
  { id: 'e220', name: 'Hall E-220', capacity: 120, equipment: ['projector', 'microphone', 'video-conference'], blocked: false, bookings: [{ start: 660, end: 780 }] },
];

// Every equipment name used in the catalog, for the filter checkboxes.
export const EQUIPMENT: string[] = Array.from(new Set(ROOMS.flatMap(room => room.equipment))).sort();
