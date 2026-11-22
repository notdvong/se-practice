// Presentation helpers: "HH:MM" text <-> minutes after midnight. No booking rules here.

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const rest = String(minutes % 60).padStart(2, '0');
  return `${hours}:${rest}`;
}
