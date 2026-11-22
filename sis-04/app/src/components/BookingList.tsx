import type { Interval } from '../rooms';
import { formatMinutes } from '../time';

// The existing bookings of the chosen room.
export default function BookingList({ roomName, bookings }: { roomName: string; bookings: Interval[] }) {
  return (
    <div className="bookings">
      <h3>Existing bookings: {roomName}</h3>
      <ul>
        {bookings.length
          ? bookings.map((b, i) => <li key={i}>{formatMinutes(b.start)}–{formatMinutes(b.end)}</li>)
          : <li>none</li>}
      </ul>
    </div>
  );
}
