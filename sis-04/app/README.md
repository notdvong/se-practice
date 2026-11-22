# Smart Campus Room Availability Checker (SIS #04)

A React + TypeScript + Vite page. A catalog of fictional rooms is filtered by number of attendees (F1)
and required equipment (F2), and the chosen room is checked against its own bookings (AC1-AC5, F3, F5).
Fictional data only: no login, payments, network calls, storage or database.

## Setup

```bash
cd sis-04/app
npm install
```

## Run

```bash
npm run dev        # open the address Vite prints
npm run build      # type-check and build
```

## Test

```bash
npx vitest run     # all tests once (the same as: npm test)
```

## Source layout (src/)

| File | What it holds |
| --- | --- |
| `rooms.ts` | the `Room` type, `ROOMS` (5 rooms) and `EQUIPMENT` |
| `filter.ts` | `filterRooms(rooms, { attendees, equipment })` |
| `booking.ts` | `canBook(...)` (AC1-AC5) and `checkRoom(rooms, roomId, request)` |
| `time.ts` | "HH:MM" text to minutes after midnight and back |
| `App.tsx`, `components/` | the page: state, wiring and presentation, no room data and no rule |
| `*.test.ts` | the Vitest tests |
