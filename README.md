# FocusDeck React v8

Functional React prototype for FocusDeck.

## Run locally

```bash
npm install
npm run dev
```

If a previous Vite server is still using your port, use:

```bash
npm run dev -- --port 4000
```

Open the Local URL shown by Vite.

## What changed in v8

- Tasks and Habits keep the cleaner v6-style layout.
- Add Task and Add Habit now use a floating plus button and modal form.
- Tasks can be added, completed, removed, filtered, and viewed as List or Calendar.
- Each task can have multiple custom reminders using date/time fields.
- Browser notifications are optional. If the user blocks permission, the app still works.
- Habits can be added and removed.
- Habits now support direction: Build or Break.
- Removed normal/minimum habit version fields.
- Review page now supports a custom date range and shows performance stats, chart, and insights.
- Full English UI copy.
- Data is saved locally using localStorage.

## Reminder limitation

Browser notifications in this prototype work while the app/browser tab is open. For reminders that work when the browser is fully closed, the next step is PWA + service worker + push notification/server scheduling.

## Reset local data

Open browser DevTools > Application > Local Storage, then remove:

- focusdeck_tasks_v8
- focusdeck_habits_v8
- focusdeck_settings_v8
