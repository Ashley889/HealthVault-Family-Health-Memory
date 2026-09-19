---
name: Reminder status model
description: Persisted reminder lifecycle and date-based transitions.
---

Reminders use exactly five statuses: upcoming, due, completed, rescheduled, and missed. Keep for later is a persisted update to due, while rescheduling updates the existing reminder rather than creating a duplicate.

**Why:** The reminder UI must survive tab changes and refreshes, and status labels must describe the actual stored reminder state. A separate pending label caused overdue reminders to drift into the wrong state, and creating a replacement reminder duplicated data.

**How to apply:** Keep completion tied to the explicit health-history save flow. Treat a future rescheduled reminder as rescheduled, and transition it to due when its date arrives. Do not auto-mark reminders completed or missed.