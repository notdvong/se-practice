import { MAX_MINUTES } from '../booking';

type Props = {
  roomName: string | null;
  now: string;
  start: string;
  end: string;
  endOfDay: boolean;
  error: string;
  result: boolean | null;
  onNowChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onEndOfDayChange: (value: boolean) => void;
  onCheck: () => void;
};

// The times form, the button and the answer. The answer is decided elsewhere (checkRoom).
export default function CheckPanel(p: Props) {
  return (
    <section className="panel" aria-labelledby="check-title">
      <h2 id="check-title">2. Check availability</h2>
      <div className="row">
        <label className="field">Current time<input type="time" value={p.now} onChange={e => p.onNowChange(e.target.value)} /></label>
        <label className="field">Start<input type="time" value={p.start} onChange={e => p.onStartChange(e.target.value)} /></label>
        <label className="field">End<input type="time" value={p.end} disabled={p.endOfDay} onChange={e => p.onEndChange(e.target.value)} /></label>
        <label className="inline"><input type="checkbox" checked={p.endOfDay} onChange={e => p.onEndOfDayChange(e.target.checked)} /> Ends at 24:00</label>
      </div>
      <button type="button" onClick={p.onCheck} disabled={p.roomName === null}>
        {p.roomName === null ? 'Select a room first' : `Check ${p.roomName}`}
      </button>
      <div aria-live="polite">
        {p.error && <p className="error">{p.error}</p>}
        {p.result !== null && (
          <p className={`result ${p.result ? 'available' : 'unavailable'}`} role="status">
            {p.result ? 'Available' : 'Unavailable'}
          </p>
        )}
        {p.result === false && (
          <p className="hint">
            A request is unavailable when it does not start after the current time, does not end after it
            starts, lasts more than {MAX_MINUTES} minutes, is for a blocked room, or overlaps a booking.
          </p>
        )}
      </div>
    </section>
  );
}
