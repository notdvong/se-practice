# AGENTS.md — Smart Campus Room Availability Checker

Instructions for any coding agent working in this project. Read this file before you change
anything, and follow it over any general habit of yours.

## Project

A React + TypeScript page (Vite) that tells a student whether a campus room is free for a
requested time. The booking rule lives in `src/booking.ts` (`canBook`); the page is `src/App.tsx`;
the tests are in `src/booking.test.ts`.

Use one fictional room named A-101 and fictional sample bookings only.

## Acceptance contract

- AC1 Reject start ≥ end and requests in the past.
- AC2 Enforce the maximum allowed duration (120 minutes).
- AC3 Reject a blocked room.
- AC4 Reject positive overlaps; a request that only touches a booking at an endpoint is allowed.
- AC5 Return Available / Unavailable without changing booking data.
- AC6 Preserve clear UI feedback on desktop and mobile.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm run test:unit`
- Build: `npm run build`

## You may

- Edit only files needed for the requested Smart Campus task; review the diff before accepting it.
- Do not add packages or dependencies without approval and a documented need.
- Do not implement login, authentication, persistence, SQL, Supabase, or any database.

## Before you finish

- Make sure the page still loads and all tests pass before proposing acceptance.
- Never commit secrets, API keys, passwords, tokens, credentials, or `.env` files.
- Do not deploy or publish this prototype to production; no Netlify or Vercel deployment.
