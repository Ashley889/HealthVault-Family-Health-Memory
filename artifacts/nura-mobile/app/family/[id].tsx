import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetProfile, useListEvents, useGetProfileSummary, useListReminders } from '@workspace/api-client-react';
import { Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate, formatShortDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function FamilyMemberScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = Number(id);
  const profile = useGetProfile(profileId);
  const events = useListEvents(profileId);
  const summary = useGetProfileSummary(profileId);
  const reminders = useListReminders();
  if (profile.isLoading || events.isLoading || reminders.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || reminders.isError || !profile.data || !events.data || !reminders.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); void reminders.refetch(); }} /></Screen>;
  const item = profile.data;
  const recentTests = events.data.filter((event) => event.type === 'test');
  const medicationEntries = events.data.flatMap((event) => {
    const names = event.medications.length ? event.medications : event.type === 'medication' ? [event.title] : [];
    return names.map((name) => ({ name, event }));
  });
  const upcoming = reminders.data.filter((reminder) => reminder.profileId === profileId && !reminder.completed).slice(0, 2);
  return (
    <Screen>
      <Header
        eyebrow={item.relationship}
        title={item.name}
        subtitle="See health memories, reminders, and journeys in one place."
        right={<Avatar initials={item.initials} color={item.color} size={54} />}
      />
      <Card style={[styles.overview, { backgroundColor: colors.softBlue }]}>
        <Text style={[styles.overviewLabel, { color: colors.primary }]}>Health overview</Text>
        <View style={styles.overviewStats}><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{events.data.length}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>memories</Text></View><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{recentTests.length}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>tests saved</Text></View><View><Text style={[styles.statNumber, { color: colors.foreground }]}>{item.bloodGroup || '—'}</Text><Text style={[styles.statLabel, { color: colors.inkSoft }]}>blood group</Text></View></View>
      </Card>
      <View style={styles.section}>
         <SectionTitle title="Health journeys" />
        <Card onPress={() => router.push({ pathname: '/journey/[id]', params: { id: String(item.id), title: events.data?.[0]?.title || 'Health journey' } })} style={styles.journeyCard}>
          <View style={[styles.journeyIcon, { backgroundColor: colors.accent }]}><Feather name="activity" size={19} color={colors.primary} /></View>
          <View style={styles.journeyCopy}><Text style={[styles.journeyTitle, { color: colors.foreground }]}>{events.data[0]?.title || 'Start a health journey'}</Text><Text style={[styles.journeyDetail, { color: colors.mutedForeground }]}>{events.data[0]?.description || 'Keep updates, tests, and doctors together.'}</Text></View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Card>
      </View>
      <View style={styles.section}>
        <SectionTitle title="Health memories" />
        <Text style={[styles.sectionIntro, { color: colors.mutedForeground }]}>{events.data.length} {events.data.length === 1 ? 'memory' : 'memories'} saved for {item.name}.</Text>
        {events.data.slice(0, 4).map((event) => <Card key={event.id} onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(event.id), profileId: String(profileId) } })} style={styles.memoryCard}><View style={[styles.detailIcon, { backgroundColor: colors.accent }]}><Feather name="activity" size={17} color={colors.primary} /></View><View style={styles.activityCopy}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{formatShortDate(event.date)}{event.provider ? ` · ${event.provider}` : ''}</Text><Text style={[styles.viewDetails, { color: colors.primary }]}>View details</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>)}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Current medications" />
        {medicationEntries.length ? medicationEntries.slice(0, 4).map(({ name, event }) => (
          <Card key={`${event.id}-${name}`} onPress={() => router.push({ pathname: '/medication/[id]', params: { id: String(event.id), profileId: String(profileId), medication: name } })} style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}><Feather name="clock" size={17} color={colors.primary} /></View>
            <View style={styles.activityCopy}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{name}</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{event.provider || 'Prescriber not added'} · {formatShortDate(event.date)}</Text></View>
            <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
          </Card>
        )) : <Card><Text style={[styles.activityTitle, { color: colors.foreground }]}>No medications saved yet</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>Add a medication during a visit or health update.</Text></Card>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Recent tests" />
        {recentTests.length ? recentTests.slice(0, 3).map((event) => (
          <Card key={event.id} style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}><Feather name="file-text" size={17} color={colors.primary} /></View>
            <View style={styles.activityCopy}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{formatShortDate(event.date)} · {event.description}</Text></View>
          </Card>
        )) : <Card><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>Tests and reports will appear here as you save them.</Text></Card>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Upcoming reminders" />
        {upcoming.length ? upcoming.map((reminder) => <Card key={reminder.id} style={styles.detailCard} onPress={() => router.push('/reminders')}><View style={[styles.detailIcon, { backgroundColor: colors.accent }]}><Feather name="calendar" size={17} color={colors.primary} /></View><View style={styles.activityCopy}><Text style={[styles.activityTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>{formatDate(reminder.date)} · {reminder.detail}</Text><Text style={[styles.viewDetails, { color: colors.primary }]}>View reminder</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Card>) : <Card><Text style={[styles.activityDetail, { color: colors.mutedForeground }]}>No upcoming follow-ups.</Text></Card>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Doctor-ready summary" />
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryText, { color: colors.inkSoft }]}>{summary.data?.overview || 'A clear summary will appear here as this family member’s health history grows.'}</Text>
          <PrimaryButton label="View doctor summary" icon="arrow-up-right" onPress={() => router.push({ pathname: '/journey/[id]', params: { id: String(item.id), title: 'Doctor summary' } })} />
        </Card>
         <OutlineButton label="Add health memory" icon="plus" onPress={() => router.push({ pathname: '/add-update', params: { profileId: String(item.id) } })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overview: { gap: 15 },
  overviewLabel: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  overviewStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statNumber: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  section: { gap: 12 },
  journeyCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  journeyIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  journeyCopy: { flex: 1, minWidth: 0, gap: 4 },
  journeyTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  journeyDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  activityCopy: { flex: 1, minWidth: 0, gap: 4 },
  activityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  activityDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  sectionIntro: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginTop: -5 },
  memoryCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewDetails: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  summaryCard: { gap: 15 },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  detailCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});