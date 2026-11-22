import { useState } from 'react';
import { ROOMS, EQUIPMENT } from './rooms';
import { filterRooms } from './filter';
import { checkRoom, MINUTES_PER_DAY } from './booking';
import { toMinutes } from './time';
import FilterPanel from './components/FilterPanel';
import RoomList from './components/RoomList';
import CheckPanel from './components/CheckPanel';
import BookingList from './components/BookingList';

// The page: state and wiring only. Room data comes from rooms, the filter from filter, the decision
// from checkRoom; nothing here decides availability.
export default function App() {
  const [attendees, setAttendees] = useState('1');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('a101');
  const [now, setNow] = useState('09:00');
  const [start, setStart] = useState('11:00');
  const [end, setEnd] = useState('12:00');
  const [endOfDay, setEndOfDay] = useState(false);
  const [answer, setAnswer] = useState<{ roomId: string; available: boolean } | null>(null);
  const [error, setError] = useState('');

  const shown = filterRooms(ROOMS, { attendees: Number(attendees) || 0, equipment });
  const selected = shown.find(room => room.id === selectedId) ?? null;
  // An answer belongs to one room: it is never shown for another one (F5).
  const result = answer && selected && answer.roomId === selected.id ? answer.available : null;

  function run(roomId: string) {
    if (!start || !now || (!end && !endOfDay)) {
      setAnswer(null);
      setError('Fill in the current time, the start and the end.');
      return;
    }
    setError('');
    const available = checkRoom(ROOMS, roomId, {
      start: toMinutes(start),
      end: endOfDay ? MINUTES_PER_DAY : toMinutes(end),
      now: toMinutes(now),
    });
    setAnswer({ roomId, available });
  }

  function selectRoom(roomId: string) {
    setSelectedId(roomId);
    if (answer) run(roomId); // refresh the answer for the newly chosen room with the same times
  }

  function toggleEquipment(item: string) {
    setEquipment(current => (current.includes(item) ? current.filter(x => x !== item) : [...current, item]));
  }

  return (
    <main className="page">
      <h1>Smart Campus Room Availability</h1>
      <FilterPanel
        attendees={attendees}
        equipmentOptions={EQUIPMENT}
        selectedEquipment={equipment}
        onAttendeesChange={setAttendees}
        onEquipmentToggle={toggleEquipment}
      />
      <RoomList rooms={shown} selectedId={selected ? selected.id : null} onSelect={selectRoom} />
      <CheckPanel
        roomName={selected ? selected.name : null}
        now={now}
        start={start}
        end={end}
        endOfDay={endOfDay}
        error={error}
        result={result}
        onNowChange={setNow}
        onStartChange={setStart}
        onEndChange={setEnd}
        onEndOfDayChange={setEndOfDay}
        onCheck={() => selected && run(selected.id)}
      />
      {selected && <BookingList roomName={selected.name} bookings={selected.bookings} />}
    </main>
  );
}
