import type { Room } from './rooms';

// F1: capacity >= attendees. F2: the room has ALL selected equipment. Blocked rooms are kept
// (the page labels them; checkRoom never reports them available, F3). The input is not changed.
export function filterRooms(
  rooms: Room[],
  criteria: { attendees: number; equipment: string[] },
): Room[] {
  const { attendees, equipment } = criteria;
  return rooms.filter(
    (room) =>
      room.capacity >= attendees &&
      equipment.every((item) => room.equipment.includes(item)),
  );
}
