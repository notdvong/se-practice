import type { Room } from '../rooms';

type Props = {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// The rooms that match the filters, one card each; a clear empty state when none do (F4).
export default function RoomList({ rooms, selectedId, onSelect }: Props) {
  if (rooms.length === 0) {
    return (
      <p className="empty" role="status">
        No rooms match these filters. Lower the number of attendees or untick some equipment.
      </p>
    );
  }
  return (
    <ul className="rooms">
      {rooms.map(room => (
        <li key={room.id}>
          <label className={`room-card${room.id === selectedId ? ' selected' : ''}${room.blocked ? ' is-blocked' : ''}`}>
            <input type="radio" name="room" value={room.id} checked={room.id === selectedId} onChange={() => onSelect(room.id)} />
            <span className="room-name">{room.name}{room.blocked && <span className="badge">Blocked</span>}</span>
            <span className="room-meta">{room.capacity} seats · {room.equipment.join(', ')}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
