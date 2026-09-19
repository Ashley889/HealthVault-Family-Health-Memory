import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCreateReminder, useListProfiles, useListReminders } from '@workspace/api-client-react';
import { Card, ErrorState, Header, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate, todayIso } from '@/lib/format';
import { loadNotificationPreferences, loadReminderStatuses, saveReminderStatus, type LocalReminderStatus } from '@/lib/preferences';
import { useColors } from '@/hooks/useColors';

type ReminderState = 'upcoming' | 'due' | 'missed' | 'rescheduled' | 'completed';
type ReminderItem = { id: number; profileId: number; title: string; date: string; detail: string; completed: boolean };

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const reminders = useListReminders();
  const profiles = useListProfiles();
  const createReminder = useCreateReminder();
  const [statuses, setStatuses] = useState<Record<string, LocalReminderStatus>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    void Promise.all([loadReminderStatuses(), loadNotificationPreferences()]).then(([loadedStatuses, preferences]) => {
      setStatuses(loadedStatuses);
      setNotificationsEnabled(preferences.enabled);
    });
  }, []);

  if (reminders.isLoading || profiles.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (reminders.isError || profiles.isError || !reminders.data || !profiles.data) return <Screen scroll={false}><ErrorState onRetry={() => { void reminders.refetch(); void profiles.refetch(); }} /></Screen>;

  const getState = (reminder: typeof reminders.data[number]): ReminderState => {
    if (reminder.completed) return 'completed';
    const localStatus = statuses[String(reminder.id)];
    if (localStatus) return localStatus;
    if (reminder.date.slice(0, 10) < todayIso()) return 'missed';
    if (reminder.date.slice(0, 10) === todayIso()) return 'due';
    return 'upcoming';
  };

  const grouped: Record<ReminderState, typeof reminders.data> = {
    due: [], upcoming: [], missed: [], rescheduled: [], completed: [],
  };
  reminders.data.forEach((reminder) => grouped[getState(reminder)].push(reminder));

  const markMissed = async (reminderId: number) => {
    await saveReminderStatus(reminderId, 'missed');
    setStatuses((current) => ({ ...current, [String(reminderId)]: 'missed' }));
  };

  const createDemoReminder = async () => {
    const profileId = profiles.data[0]?.id;
    if (!profileId) return;
    await createReminder.mutateAsync({ data: { profileId, title: 'Annual wellness check', date: todayIso(), detail: 'Aditi Sharma · Annual health check appointment' } });
    await reminders.refetch();
  };

  return (
    <Screen>
      <Header eyebrow="Keep things close" title="Follow-ups" subtitle="Simple reminders for the next thing your family needs." />
      {notificationsEnabled ? <View style={[styles.notificationBanner, { backgroundColor: colors.softBlue }]}><Feather name="bell" size={16} color={colors.primary} /><Text style={[styles.notificationText, { color: colors.inkSoft }]}>Notifications are on. Nura will remind you before upcoming care.</Text></View> : null}
      <View style={[styles.countCard, { backgroundColor: colors.softBlue }]}>
        <Text style={[styles.count, { color: colors.primary }]}>{grouped.upcoming.length + grouped.due.length}</Text>
        <View style={styles.countCopy}><Text style={[styles.countTitle, { color: colors.foreground }]}>upcoming moments</Text><Text style={[styles.countText, { color: colors.mutedForeground }]}>A little nudge when it matters.</Text></View>
      </View>
      {grouped.due.length ? <ReminderSection title="Due today" reminders={grouped.due} profiles={profiles.data} state="due" colors={colors} onYes={(reminder) => router.push({ pathname: '/add-update', params: { profileId: String(reminder.profileId), reminderId: String(reminder.id), prefillTitle: reminder.title, prefillType: 'visit' } })} onNotYet={(reminder) => Alert.alert('Not completed yet', 'You can leave this reminder due or mark it as missed.', [{ text: 'Keep due', style: 'cancel' }, { text: 'Mark as missed', style: 'destructive', onPress: () => { void markMissed(reminder.id); } }])} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.upcoming.length ? <ReminderSection title="Upcoming" reminders={grouped.upcoming} profiles={profiles.data} state="upcoming" colors={colors} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : <Card style={styles.emptyCard}><Text style={[styles.reminderTitle, { color: colors.foreground }]}>No upcoming reminders</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Add follow-ups after a visit or test.</Text><PrimaryButton label={createReminder.isPending ? 'Creating demo reminder…' : 'Try a due reminder'} icon="calendar" disabled={createReminder.isPending} onPress={() => { void createDemoReminder(); }} /></Card>}
      {grouped.rescheduled.length || grouped.missed.length ? <ReminderSection title="Needs attention" reminders={[...grouped.rescheduled, ...grouped.missed]} profiles={profiles.data} state="missed" colors={colors} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      <SectionTitle title="Completed" />
      {grouped.completed.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.data.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state="completed" colors={colors} />)}
      {!grouped.completed.length ? <Card><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Completed visits will stay here after you save them to health history.</Text></Card> : null}
    </Screen>
  );
}

function ReminderSection({ title, reminders, profiles, state, colors, onYes, onNotYet, onReschedule }: { title: string; reminders: ReminderItem[]; profiles: Array<{ id: number; name: string }>; state: ReminderState; colors: ReturnType<typeof useColors>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  return <View style={styles.section}><SectionTitle title={title} />{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state={state} colors={colors} onYes={onYes} onNotYet={onNotYet} onReschedule={onReschedule} />)}</View>;
}

function ReminderCard({ reminder, profile, state, colors, onYes, onNotYet, onReschedule }: { reminder: ReminderItem; profile: string; state: ReminderState; colors: ReturnType<typeof useColors>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  const stateLabel = state === 'due' ? 'Due' : state === 'completed' ? 'Completed' : state === 'missed' ? 'Missed' : state === 'rescheduled' ? 'Rescheduled' : 'Upcoming';
  const stateColor = state === 'completed' ? colors.success : state === 'missed' ? colors.destructive : colors.primary;
  return <Card style={[styles.reminderCard, state === 'completed' && styles.completedCard]}><View style={[styles.reminderIcon, { backgroundColor: state === 'due' ? colors.primary : colors.accent }]}><Feather name={state === 'completed' ? 'check-circle' : 'calendar'} size={18} color={state === 'due' ? colors.primaryForeground : stateColor} /></View><View style={styles.reminderCopy}><Text style={[styles.reminderTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>{profile} · {reminder.detail}</Text><Text style={[styles.reminderDate, { color: stateColor }]}>{formatDate(reminder.date)}</Text><View style={[styles.statusPill, { backgroundColor: state === 'completed' ? colors.muted : colors.accent }]}><Text style={[styles.statusText, { color: stateColor }]}>{stateLabel}</Text></View>{state === 'due' ? <View style={styles.actions}><Pressable onPress={() => onYes?.(reminder)} style={[styles.actionButton, { backgroundColor: colors.primary }]}><Text style={[styles.actionText, { color: colors.primaryForeground }]}>Yes, I went</Text></Pressable><Pressable onPress={() => onNotYet?.(reminder)} style={[styles.actionButton, { borderColor: colors.border }]}><Text style={[styles.actionText, { color: colors.inkSoft }]}>Not yet</Text></Pressable></View> : null}{state === 'upcoming' || state === 'missed' || state === 'rescheduled' ? <Pressable onPress={() => onReschedule?.(reminder)} style={[styles.rescheduleButton, { borderColor: colors.border }]}><Feather name="calendar" size={14} color={colors.primary} /><Text style={[styles.rescheduleText, { color: colors.inkSoft }]}>{state === 'upcoming' ? 'Change date' : 'Reschedule'}</Text></Pressable> : null}</View></Card>;
}

const styles = StyleSheet.create({
  notificationBanner: { borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  notificationText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 18 },
  countCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  count: { fontFamily: 'Inter_700Bold', fontSize: 44, letterSpacing: -1 },
  countCopy: { gap: 3 },
  countTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  countText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  section: { gap: 12 },
  emptyCard: { gap: 13 },
  reminderCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reminderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reminderCopy: { flex: 1, minWidth: 0, gap: 5 },
  reminderTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  reminderDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  reminderDate: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  completedCard: { opacity: 0.8 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  actionButton: { minHeight: 40, borderRadius: 13, borderWidth: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  rescheduleButton: { alignSelf: 'flex-start', minHeight: 34, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  rescheduleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});