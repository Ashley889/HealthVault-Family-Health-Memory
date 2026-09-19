import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [notYetReminder, setNotYetReminder] = useState<ReminderItem | null>(null);

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
    if (localStatus && localStatus !== 'pending') return localStatus;
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

  const keepForLater = async (reminderId: number) => {
    await saveReminderStatus(reminderId, 'pending');
    setStatuses((current) => ({ ...current, [String(reminderId)]: 'pending' }));
    setNotYetReminder(null);
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
      {grouped.due.length ? <ReminderSection title="Due today" reminders={grouped.due} profiles={profiles.data} state="due" colors={colors} pendingIds={statuses} onYes={(reminder) => router.push({ pathname: '/add-update', params: { profileId: String(reminder.profileId), reminderId: String(reminder.id), prefillTitle: reminder.title, prefillType: 'visit' } })} onNotYet={setNotYetReminder} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.upcoming.length ? <ReminderSection title="Upcoming" reminders={grouped.upcoming} profiles={profiles.data} state="upcoming" colors={colors} pendingIds={statuses} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : <Card style={styles.emptyCard}><Text style={[styles.reminderTitle, { color: colors.foreground }]}>No upcoming reminders</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Add follow-ups after a visit or test.</Text><PrimaryButton label={createReminder.isPending ? 'Creating demo reminder…' : 'Try a due reminder'} icon="calendar" disabled={createReminder.isPending} onPress={() => { void createDemoReminder(); }} /></Card>}
      {grouped.rescheduled.length ? <ReminderSection title="Rescheduled" reminders={grouped.rescheduled} profiles={profiles.data} state="rescheduled" colors={colors} pendingIds={statuses} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.missed.length ? <ReminderSection title="Missed" reminders={grouped.missed} profiles={profiles.data} state="missed" colors={colors} pendingIds={statuses} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      <SectionTitle title="Completed" />
      {grouped.completed.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.data.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state="completed" colors={colors} />)}
      {!grouped.completed.length ? <Card><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Completed visits will stay here after you save them to health history.</Text></Card> : null}
      <Modal visible={Boolean(notYetReminder)} transparent animationType="slide" onRequestClose={() => setNotYetReminder(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Not completed yet</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>No worries. What would you like to do with this reminder?</Text>
            <ActionSheetButton title="Reschedule" detail="Move this reminder to another date." icon="calendar" colors={colors} onPress={() => { if (notYetReminder) router.push({ pathname: '/reminder/[id]', params: { id: String(notYetReminder.id) } }); setNotYetReminder(null); }} />
            <ActionSheetButton title="Keep for later" detail="Keep the reminder active so you can come back to it." icon="clock" colors={colors} onPress={() => { if (notYetReminder) void keepForLater(notYetReminder.id); }} />
            <ActionSheetButton title="Mark as missed" detail="Record that the appointment or check-up did not happen." icon="x-circle" colors={colors} destructive onPress={() => { if (!notYetReminder) return; const reminderId = notYetReminder.id; setNotYetReminder(null); Alert.alert('Mark reminder as missed?', 'This will record that this reminder was not completed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Mark as missed', style: 'destructive', onPress: () => { void markMissed(reminderId); } }]); }} />
            <Pressable onPress={() => setNotYetReminder(null)} style={[styles.cancelSheetButton, { borderColor: colors.border }]}><Text style={[styles.cancelSheetText, { color: colors.inkSoft }]}>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function ReminderSection({ title, reminders, profiles, state, colors, pendingIds, onYes, onNotYet, onReschedule }: { title: string; reminders: ReminderItem[]; profiles: Array<{ id: number; name: string }>; state: ReminderState; colors: ReturnType<typeof useColors>; pendingIds: Record<string, LocalReminderStatus>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  return <View style={styles.section}><SectionTitle title={title} />{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state={state} pending={pendingIds[String(reminder.id)] === 'pending'} colors={colors} onYes={onYes} onNotYet={onNotYet} onReschedule={onReschedule} />)}</View>;
}

function ReminderCard({ reminder, profile, state, pending, colors, onYes, onNotYet, onReschedule }: { reminder: ReminderItem; profile: string; state: ReminderState; pending?: boolean; colors: ReturnType<typeof useColors>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  const stateLabel = pending ? 'Still pending' : state === 'due' ? 'Due' : state === 'completed' ? 'Completed' : state === 'missed' ? 'Missed' : state === 'rescheduled' ? 'Rescheduled' : 'Upcoming';
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
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14, 32, 48, 0.32)' },
  actionSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, padding: 20, gap: 12 },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 4 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  sheetSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 4 },
  sheetAction: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sheetActionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sheetActionCopy: { flex: 1, gap: 3 },
  sheetActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  sheetActionDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  cancelSheetButton: { minHeight: 46, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cancelSheetText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});

function ActionSheetButton({ title, detail, icon, colors, destructive, onPress }: { title: string; detail: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors>; destructive?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.sheetAction, { borderColor: colors.border }]}><View style={[styles.sheetActionIcon, { backgroundColor: destructive ? colors.muted : colors.accent }]}><Feather name={icon} size={17} color={destructive ? colors.destructive : colors.primary} /></View><View style={styles.sheetActionCopy}><Text style={[styles.sheetActionTitle, { color: destructive ? colors.destructive : colors.foreground }]}>{title}</Text><Text style={[styles.sheetActionDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}