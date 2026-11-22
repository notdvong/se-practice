import { useMemo, useState, type FormEvent } from 'react';
import { canBook, type Booking } from './booking';

const INITIAL_BOOKINGS: Booking[] = [
  { start: 660, end: 720 },
  { start: 810, end: 870 },
];

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function App() {
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [now, setNow] = useState('08:30');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<'idle' | 'available' | 'unavailable'>('idle');
  const [message, setMessage] = useState('Choose a time and check availability.');

  const bookings = useMemo(() => INITIAL_BOOKINGS.map((booking) => ({ ...booking })), []);

  function checkAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);
    const nowMinutes = toMinutes(now);

    if (!canBook({ start: startMinutes, end: endMinutes, now: nowMinutes, blocked, bookings })) {
      setResult('unavailable');
      setMessage('This time is unavailable. Check the time range, room status and existing bookings.');
      return;
    }

    setResult('available');
    setMessage('The room is available for this time. No booking has been created or saved.');
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Smart Campus home">
          <span className="brand-mark">SC</span>
          <span>Smart Campus</span>
        </a>
        <span className="topbar-label">ROOM SERVICES</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> CAMPUS SPACE PLANNER</span>
          <h1>Find a room<br /><em>that works.</em></h1>
          <p className="intro">Check a room's availability before you plan your next study session.</p>
        </div>
        <div className="hero-card" aria-label="Room details">
          <div className="hero-card-icon">⌂</div>
          <div>
            <span className="mini-label">SELECTED SPACE</span>
            <h2>Room A-101</h2>
            <p>Academic Building · Level 1</p>
          </div>
          <span className="fictional-badge">Sample room</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel booking-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">AVAILABILITY CHECK</span>
              <h2>Choose your time</h2>
            </div>
            <span className="step-pill">01 / 01</span>
          </div>

          <form onSubmit={checkAvailability}>
            <label className="field-label" htmlFor="now">Current time</label>
            <div className="input-wrap">
              <input id="now" type="time" value={now} onChange={(event) => setNow(event.target.value)} required />
              <span className="input-hint">Used to prevent past requests</span>
            </div>

            <div className="time-row">
              <div>
                <label className="field-label" htmlFor="start">Start time</label>
                <input id="start" type="time" value={start} onChange={(event) => setStart(event.target.value)} required />
              </div>
              <div className="time-arrow" aria-hidden="true">→</div>
              <div>
                <label className="field-label" htmlFor="end">End time</label>
                <input id="end" type="time" value={end} onChange={(event) => setEnd(event.target.value)} required />
              </div>
            </div>

            <label className="blocked-toggle">
              <input type="checkbox" checked={blocked} onChange={(event) => setBlocked(event.target.checked)} />
              <span className="toggle-ui" />
              <span><strong>Room blocked for maintenance</strong><small>Use this to test an unavailable room.</small></span>
            </label>

            <button className="check-button" type="submit">Check availability <span aria-hidden="true">↗</span></button>
          </form>

          <div className={`result-card ${result}`} role="status" aria-live="polite">
            <span className="result-icon">{result === 'available' ? '✓' : result === 'unavailable' ? '!' : 'i'}</span>
            <div>
              <strong>{result === 'available' ? 'Available' : result === 'unavailable' ? 'Unavailable' : 'Ready when you are'}</strong>
              <p>{message}</p>
            </div>
          </div>
        </div>

        <aside className="panel schedule-panel">
          <div className="panel-heading schedule-heading">
            <div>
              <span className="section-kicker">TODAY'S SAMPLE SCHEDULE</span>
              <h2>Existing bookings</h2>
            </div>
            <span className="calendar-icon">▦</span>
          </div>
          <p className="schedule-note">Fictional bookings for this demo room.</p>
          <div className="booking-list">
            {bookings.map((booking, index) => (
              <div className="booking-item" key={`${booking.start}-${booking.end}`}>
                <span className="booking-time">{formatTime(booking.start)} – {formatTime(booking.end)}</span>
                <div className="booking-detail"><span className="booking-bar" /><span>{index === 0 ? 'Seminar session' : 'Study group'}</span></div>
              </div>
            ))}
          </div>
          <div className="rule-note">
            <span className="rule-icon">✳</span>
            <p><strong>Good to know</strong>Requests can be up to 120 minutes. A time that touches another booking is still allowed.</p>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <span>SMART CAMPUS · ROOM AVAILABILITY</span>
        <span>Demo prototype · No reservation is stored</span>
      </footer>
    </main>
  );
}
