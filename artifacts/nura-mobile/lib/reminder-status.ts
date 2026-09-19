export type ReminderStatus = 'upcoming' | 'due' | 'completed' | 'rescheduled' | 'missed';
export type ReminderAction = 'complete' | 'keep-for-later' | 'reschedule' | 'miss';

export function reminderStateForDate(status: ReminderStatus, date: string, today: string): ReminderStatus {
  if (status === 'completed' || status === 'missed') return status;
  if (date <= today) return 'due';
  return status === 'rescheduled' ? 'rescheduled' : 'upcoming';
}

export function nextReminderStatus(current: ReminderStatus, action: ReminderAction): ReminderStatus {
  if (action === 'complete') return 'completed';
  if (action === 'keep-for-later') return 'due';
  if (action === 'reschedule') return 'rescheduled';
  if (action === 'miss') return 'missed';
  return current;
}