import { nextReminderStatus, reminderStateForDate } from './reminder-status.ts';

function assertEqual(actual: string, expected: string) {
  if (actual !== expected) throw new Error(`Expected ${expected}, received ${actual}`);
}

assertEqual(reminderStateForDate('upcoming', '2026-09-25', '2026-09-24'), 'upcoming');
assertEqual(reminderStateForDate('upcoming', '2026-09-25', '2026-09-25'), 'due');
assertEqual(nextReminderStatus('due', 'complete'), 'completed');
assertEqual(nextReminderStatus('due', 'reschedule'), 'rescheduled');
assertEqual(nextReminderStatus('due', 'miss'), 'missed');
assertEqual(nextReminderStatus('due', 'keep-for-later'), 'due');
assertEqual(reminderStateForDate('rescheduled', '2026-09-30', '2026-09-29'), 'rescheduled');
assertEqual(reminderStateForDate('rescheduled', '2026-09-30', '2026-09-30'), 'due');
assertEqual(reminderStateForDate('completed', '2026-09-01', '2026-09-30'), 'completed');
assertEqual(reminderStateForDate('missed', '2026-09-01', '2026-09-30'), 'missed');

console.log('Reminder status transitions passed.');