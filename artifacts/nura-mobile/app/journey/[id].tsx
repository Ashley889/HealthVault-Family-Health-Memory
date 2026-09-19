import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetProfile, useListEvents } from '@workspace/api-client-react';
import { Card, ErrorState, Header, LoadingState, OutlineButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function JourneyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const profileId = Number(id);
  const profile = useGetProfile(profileId);
  const events = useListEvents(profileId);
  if (profile.isLoading || events.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (profile.isError || events.isError || !profile.data || !events.data) return <Screen scroll={false}><ErrorState onRetry={() => { void profile.refetch(); void events.refetch(); }} /></Screen>;
  const medicationEntries = events.data.flatMap((event) => {
    const names = event.medications.length ? event.medications : event.type === 'medication' ? [event.title] : [];
    return names.map((name) => ({ name, event }));
  });
  const currentMedications = medicationEntries.filter(({ event }) => !event.tags.some((tag) => ['completed', 'stopped'].includes(tag.toLowerCase())));
  const previousMedications = medicationEntries.filter(({ event }) => event.tags.some((tag) => ['completed', 'stopped'].includes(tag.toLowerCase())));
  const reports = events.data.filter((event) => event.type === 'test');
  const doctors = Array.from(new Set(events.data.map((event) => event.provider).filter(Boolean)));
  return (
    <Screen>
      <Header eyebrow="Health journey" title={title || events.data[0]?.title || 'Health journey'} subtitle={`${profile.data.name} · ongoing record`} />
      <Card style={[styles.statusCard, { backgroundColor: colors.softBlue }]}>
        <View style={styles.statusLine}><View style={[styles.statusDot, { backgroundColor: colors.success }]} /><Text style={[styles.statusText, { color: colors.foreground }]}>Ongoing</Text></View>
        <Text style={[styles.statusDetail, { color: colors.inkSoft }]}>Keep the full story together, from the first question to the next follow-up.</Text>
      </Card>
      <View style={styles.section}><SectionTitle title="Timeline" /><View style={styles.timeline}>{events.data.map((event, index) => <View key={event.id} style={styles.timelineRow}><View style={styles.rail}><View style={[styles.dot, { backgroundColor: colors.primary }]} />{index < events.data.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}</View><View style={styles.timelineCopy}><Text style={[styles.date, { color: colors.primary }]}>{formatDate(event.date)}</Text><Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>{event.description}</Text>{event.provider ? <Text style={[styles.meta, { color: colors.inkSoft }]}>Doctor · {event.provider}</Text> : null}</View></View>)}</View></View>
      <View style={styles.section}>
        <SectionTitle title="Medications" />
        {currentMedications.length ? currentMedications.map(({ name, event }) => <Card key={`${event.id}-${name}`} style={styles.reportCard} onPress={() => router.push({ pathname: '/medication/[id]', params: { id: String(event.id), profileId: String(profileId), medication: name } })}><View style={[styles.reportIcon, { backgroundColor: colors.accent }]}><Feather name="clock" size={18} color={colors.primary} /></View><View style={styles.reportCopy}><Text style={[styles.eventTitle, { color: colors.foreground }]}>{name}</Text><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>{event.provider || 'Prescriber not added'} · Active</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Card>) : <Card><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>No current medications saved.</Text></Card>}
        {previousMedications.length ? <><SectionTitle title="Previous medications" />{previousMedications.map(({ name, event }) => <Card key={`previous-${event.id}-${name}`} style={styles.reportCard} onPress={() => router.push({ pathname: '/medication/[id]', params: { id: String(event.id), profileId: String(profileId), medication: name } })}><View style={[styles.reportIcon, { backgroundColor: colors.muted }]}><Feather name="archive" size={18} color={colors.mutedForeground} /></View><View style={styles.reportCopy}><Text style={[styles.eventTitle, { color: colors.foreground }]}>{name}</Text><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>{event.provider || 'Prescriber not added'} · {event.tags.find((tag) => ['completed', 'stopped'].includes(tag.toLowerCase()))}</Text></View></Card>)}</> : null}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Reports" />
        {reports.length ? reports.map((event) => <Card key={event.id} style={styles.reportCard}><View style={[styles.reportIcon, { backgroundColor: colors.accent }]}><Feather name="file-text" size={18} color={colors.primary} /></View><View style={styles.reportCopy}><Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>{formatDate(event.date)} · {event.description}</Text></View></Card>) : <Card><Text style={[styles.eventBody, { color: colors.mutedForeground }]}>Test memories and uploaded reports will appear here.</Text></Card>}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Care team" />
        <Card style={styles.careCard}><Feather name="user-check" size={18} color={colors.primary} /><Text style={[styles.eventBody, { color: colors.inkSoft }]}>{doctors.length ? doctors.join(' · ') : 'Doctors and providers will be collected from visit updates.'}</Text></Card>
      </View>
      <OutlineButton label="Add update to this journey" icon="plus" onPress={() => router.push({ pathname: '/add-update', params: { profileId: String(profileId) } })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusCard: { gap: 10 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  statusDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  section: { gap: 12 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 14, alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  line: { width: 1, flex: 1, marginVertical: 4 },
  timelineCopy: { flex: 1, minWidth: 0, paddingBottom: 18, gap: 5 },
  date: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  eventTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  eventBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  meta: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  reportCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  reportCopy: { flex: 1, minWidth: 0, gap: 4 },
  careCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});